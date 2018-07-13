import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import * as tf from '@tensorflow/tfjs'

import examplePath from './exampleImage.png'

import './App.css'

const displayDim = 256
const inputDim = 104

const modelPath = 'https://res.cloudinary.com/dqza9dw1h/raw/upload/v1531441276/laboratory%20one/ml/animeGN/model.json'

class App extends Component {
  constructor() {
    super()

    this.state = {
      imageData: null,
      model: null
    }

    this.onDrop = this.onDrop.bind(this)
    this.styleImage = this.styleImage.bind(this)
  }

  componentWillMount() {
    // load the model
    this.loadModel(modelPath)
  }

  componentDidMount() {
    // generate example image from path
    const image = this.generateImage(examplePath)

    // draw example image
    this.updateCanvas(image)
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

  // generates ImageData from a path
  generateImage(path) {
    // create image
    var image = new Image()

    // bind an image to it
    image.src = path

    return image
  }

  // grabs image data from a canvas using it's context
  getImageData (ctx) {
    var imageData = ctx.getImageData(0, 0, displayDim, displayDim)

    this.setState({ imageData })
  }

  // loads the model from a file then stores the ref to state
  loadModel(modelPath) {
    const loadModel = async () =>  await tf.loadModel(modelPath)

    loadModel()
      .then(model => {this.setState({ model })})
      .catch(error => console.log(error))
  }

  // handles ondrop event from drop zone
  onDrop(files) {
    // generate example image from path
    const image = this.generateImage(files[0].preview)

    this.updateCanvas(image)
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

  // draw an image on to a canvas using it's path
  updateCanvas(image) {
    // grab canvas context
    const ctx = this.refs.exampleCanvas.getContext('2d')

    // attach a cb for when the image loads
    image.onload = () => {
      // draw the image onto the canvas
      ctx.drawImage(image, 0, 0)

      // grabs image data from a canvas
      this.getImageData(ctx)
    }
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <h1 className="title">animeGN</h1>
          <p className="subtitle">Style images as anime</p>
        </div>

        <Dropzone
          className="dropContainer"
          onDrop={this.onDrop}>
          <div className="imagesContainer">
            <div className="imageContainer">
              <canvas
                className="image"
                height={displayDim}
                ref="exampleCanvas"
                width={displayDim}
              />
              <p className="label">
                Source Image
                <span role='img' aria-label='above'>☝️</span>
              </p>
            </div>

            <div className="imageContainer">
              <canvas
                className="image"
                height={displayDim}
                ref="styledCanvas"
                width={displayDim}
              />
              <p className="label">
                <span role='img' aria-label='above'>☝️</span>
                Styled Image
              </p>
            </div>
          </div>

          <p className='text'>Drop an image and style it</p>
        </Dropzone>

        <input
          className={'button'}
          onClick={this.styleImage}
          type='button'
          value='s t y l e i m a g e 💁‍♀️'
        />
      </div>
    );
  }
}

export default App;
