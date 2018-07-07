import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs'
import './App.css'

const displayDim = 256
const examplePath = '/example-256.png'
const inputDim = 104
const modelPath = '/layersModel/model.json'

class App extends Component {
  constructor() {
    super()

    this.state = {
      imageData: null,
      model: null
    }

    this.styleImage = this.styleImage.bind(this)
  }

  componentWillMount() {
    // load the model
    this.loadModel(modelPath)
  }

  componentDidMount() {
    // draw example image
    this.updateCanvas(examplePath)
  }

  // loads the model from a file then stores the ref to state
  loadModel(modelPath) {
    const loadModel = async () => await tf.loadModel(modelPath)

    loadModel().then(model => this.setState({ model }))
  }

  // draw an image on to a canvas using it's path
  updateCanvas(imagePath) {
    // grab canvas context
    const ctx = this.refs.exampleCanvas.getContext('2d')

    // create image
    var image = new Image()

    // bind an image to it
    image.src = imagePath

    // attach a cb for when the image loads
    image.onload = () => {
      // draw the image onto the canvas
      ctx.drawImage(image, 0, 0)

      // grabs image data from a canvas
      this.getImageData(ctx)
    }
  }

  // grabs image data from a canvas using it's context
  getImageData (ctx) {
    var imageData = ctx.getImageData(0, 0, displayDim, displayDim)

    this.setState({ imageData })
  }

  // preprocess the image so that it's in the format we expect
  preprocessImage(imageData) {
    // convert the image data into a tf tensor (3D)
    let preprocessedTensor = tf.fromPixels(imageData)

    // cast the data from int32 to float32
    preprocessedTensor = tf.cast(preprocessedTensor, 'float32')

    // normalize the data since it was previously int32
    preprocessedTensor = tf.div(preprocessedTensor, 255)

    // resize the image to the inputDim
    preprocessedTensor = tf.image.resizeBilinear(
                        preprocessedTensor,
                        [inputDim, inputDim]
                      )

    // convert the image to the expected input for this model (4D)
    preprocessedTensor = preprocessedTensor.reshape([-1, inputDim, inputDim, 3])

    return preprocessedTensor
  }

  // deprocess the image so that it's in the format which we can render
  deprocessImage(tensor) {

    // resize the image to displayDim
    let deprocessedTensor = tf.image.resizeBilinear(
                              tensor,
                              [displayDim, displayDim]
                            )

    // convert the 4D tensor to 3D so that we can render it
    deprocessedTensor = deprocessedTensor.reshape([displayDim, displayDim, 3])

    return deprocessedTensor
  }

  // styles an image and draws it to a canvas
  styleImage () {
    const { imageData, model } = this.state

    // exit if the model has not loaded
    if (model === null) {
      return
    }

    // preprocess the image so that it's in the format we expect
    let tfExample = this.preprocessImage(imageData)

    // make prediction
    let reconstruction = model.predict(tfExample)

    // deprocess so that we can render it
    reconstruction = this.deprocessImage(reconstruction)

    // draw tensor to canvas
    tf.toPixels(reconstruction, this.refs.styledCanvas)
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <h1 className="title">animeGN</h1>
          <p className="subtitle">Style images as anime</p>
        </div>

        <div className="imagesContainer">
          <div className="imageContainer">
            <canvas
              className="image"
              height={displayDim}
              ref="exampleCanvas"
              width={displayDim}
            />
            <p className="label">Example Image</p>
          </div>

          <div className="imageContainer">
            <canvas
              className="image"
              height={displayDim}
              ref="styledCanvas"
              width={displayDim}
            />
            <p className="label">Styled Image</p>
          </div>
        </div>

        <input
          className={'button'}
          onClick={this.styleImage}
          type='button'
          value='STYLE IMAGE!'
        />
      </div>
    );
  }
}

export default App;
