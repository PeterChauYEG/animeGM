# animeML

The goal of this project is to stylize an photograph as anime.

## Methodology
Each notebook progressively enhances the complexity of the model. Some have weight checkpoints which allow for saving and loading of model weights. Some have logfiles which allow for use of tensorboard for analysis. Some use GPUs.

## Usage
1. Run the notebook:
```
$ source activate ai
$ jupyter lab
```

2. Ensure GPUs and CPUs are configured correctly.
3. Configure Data paths, and ensure images are in the correct directory.

4. Configure hyper parameters

5. Monitor with tensorboard:

  ```
  $ tensorboard --logdir=log
  ```
  **NOTE**: You may need to configure tensorboard's `main.py` to use the CPU.

  ```
  import os

  os.environ["CUDA_VISIBLE_DEVICES"]="1"
  ```

6. Monitor your GPU usage:
```
$ nvidia-smi -l 2
```

7. Monitor your CPU and memory usage with:
```
$ htop
```

8. Convert model to layers format for tensorflowjs usage with:
```
tensorflowjs_converter --input_format keras models/model.hdf5 layersModel
```

9. Move the layersModel folder into the web app public dir `webapp/public` with:
```
cp -R layersModel webapp/public/layersModel
```
