import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs'
import './App.css'

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
    this.loadModel('/layersModel/model.json')
  }

  componentDidMount() {
    // draw example image
    this.updateCanvas('/example-104.png')
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
    var imageData = ctx.getImageData(0, 0, 104, 104)

    this.setState({ imageData })
  }

  // preprocess the image so that it's in the format we expect
  preprocessImage(imageData) {
    // convert the image data into a tf tensor (3D)
    let processedTensor = tf.fromPixels(imageData)

    // cast the data from int32 to float32
    processedTensor = tf.cast(processedTensor, 'float32')

    // normalize the data since it was previously int32
    processedTensor = tf.div(processedTensor, 255)

    // convert the image to the expected input for this model (4D)
    processedTensor = processedTensor.reshape([-1, 104, 104, 3])

    return processedTensor
  }

  // deprocess the image so that it's in the format which we can render
  deprocessImage(tensor) {
    // convert the 4D tensor to 3D so that we can render it
    let deprocessedTensor = tensor.reshape([104, 104, 3])

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
              height={104}
              ref="exampleCanvas"
              width={104}
            />
            <p className="label">Example Image</p>
          </div>

          <div className="imageContainer">
            <canvas
              className="image"
              height={104}
              ref="styledCanvas"
              width={104}
            />
            <p className="label">Styled Image</p>
          </div>
        </div>

        <input
          className="button"
          onClick={this.styleImage}
          type='button'
          value='STYLE IMAGE!'
        />
      </div>
    );
  }
}

export default App;
