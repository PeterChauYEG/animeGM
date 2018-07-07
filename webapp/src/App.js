import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs'

class App extends Component {
  constructor() {
    super()

    this.state = {
      imageData: null,
      model: null
    }

    this.reconstructImage = this.reconstructImage.bind(this)
  }

  componentWillMount() {
    const loadModel = async () => await tf.loadModel('http://localhost:3000/layersModel/model.json')

    loadModel().then(model => this.setState({ model }))
  }

  componentDidMount() {
    this.updateCanvas()
  }

  updateCanvas() {
    // grab canvas context
    const ctx = this.refs.exampleCanvas.getContext('2d')

    // create image
    var exampleImg = new Image()

    // bind an image to it
    exampleImg.src = 'http://localhost:3000/example-104.png'

    exampleImg.onload = () => {
      // draw the image onto the canvas
      ctx.drawImage(exampleImg, 0, 0)

      this.getImageData(ctx)
    }
  }

  getImageData (ctx) {
    var imageData = ctx.getImageData(0, 0, 104, 104)

    this.setState({ imageData })
  }

  reconstructImage () {
    const { imageData, model } = this.state

    if (model === null) {
      return
    }

    let tfExample = tf.fromPixels(imageData)
    tfExample = tf.cast(tfExample, 'float32')
    tfExample = tf.div(tfExample, 255)

    this.renderPrediction(tfExample)

    tfExample = tfExample.reshape([-1, 104, 104, 3])

    let reconstruction = model.predict(tfExample)

    reconstruction = reconstruction.reshape([104, 104, 3])

    this.renderPrediction(reconstruction)
  }

  renderPrediction(reconstructionImage) {
    tf.toPixels(reconstructionImage, this.refs.reconstructionCanvas)
  }

  render() {
    return (
      <div className="App">
        <h1>animeGM - styling images as anime</h1>
        <div>
          <div>
            <p>Example Image</p>
            <canvas ref="exampleCanvas" width={104} height={104} />
          </div>
          <div>
            <p>Reconstructed Image</p>
            <canvas ref="reconstructionCanvas" width={104} height={104} />
          </div>
        </div>
        <input type='button' value='reconstruct image!' onClick={this.reconstructImage} />
      </div>
    );
  }
}

export default App;
