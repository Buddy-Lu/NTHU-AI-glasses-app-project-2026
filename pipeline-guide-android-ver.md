The MediaPipe Hand Landmarker task lets you detect the landmarks of the hands in an image.
These instructions show you how to use the Hand Landmarker with Android apps. The
code sample described in these instructions is available on
[GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/android).

For more information about the capabilities, models, and configuration options
of this task, see the [Overview](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/index).

## Code example

The MediaPipe Tasks example code is a simple implementation of a Hand Landmarker
app for Android. The example uses the camera on a physical Android device to
continuously detect hand landmarks, and can also use images and videos from the
device gallery to statically detect hand landmarks.

You can use the app as a starting point for your own Android app, or refer to it
when modifying an existing app. The Hand Landmarker example code is hosted on
[GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker).

### Download the code

The following instructions show you how to create a local copy of the example
code using the [git](https://git-scm.com/) command line tool.

> [!WARNING]
> **Attention:** This MediaPipe Solutions Preview is an early release. [Learn more](https://ai.google.dev/edge/mediapipe/solutions/about#notice).

To download the example code:

1. Clone the git repository using the following command:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. Optionally, configure your git instance to use sparse checkout, so you have only the files for the Hand Landmarker example app:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/hand_landmarker/android
   ```

After creating a local version of the example code, you can import the project
into Android Studio and run the app. For instructions, see the
[Setup Guide for Android](https://ai.google.dev/mediapipe/solutions/setup_android#example_code).

### Key components

The following files contain the crucial code for this hand landmark
detection example application:

- [HandLandmarkerHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt) - Initializes the hand landmark detector and handles the model and delegate selection.
- [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/MainActivity.kt) - Implements the application, including calling `HandLandmarkerHelper`.

## Setup

This section describes key steps for setting up your development environment and
code projects specifically to use Hand Landmarker. For general information on
setting up your development environment for using MediaPipe tasks, including
platform version requirements, see the
[Setup guide for Android](https://ai.google.dev/mediapipe/solutions/setup_android).

> [!WARNING]
> **Attention:** This MediaPipe Solutions Preview is an early release. [Learn more](https://ai.google.dev/edge/mediapipe/solutions/about#notice).

### Dependencies

The Hand Landmarker task uses the `com.google.mediapipe:tasks-vision`
library. Add this dependency to the `build.gradle` file of your Android app:

    dependencies {
        implementation 'com.google.mediapipe:tasks-vision:latest.release'
    }

### Model

The MediaPipe Hand Landmarker task requires a trained model bundle that is compatible with
this task. For more information on available trained models for Hand Landmarker,
see the task overview [Models section](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/index#models).

Select and download the model, and store it within your project directory:

    <dev-project-root>/src/main/assets

Specify the path of the model within the `ModelAssetPath` parameter. In the
example code,
the model is defined in the [`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L84)
file:

    baseOptionBuilder.setModelAssetPath(MP_HAND_LANDMARKER_TASK)

## Create the task

The MediaPipe Hand Landmarker task uses the `createFromOptions()` function to set up the
task. The `createFromOptions()` function accepts values for the configuration
options. For more information on configuration options, see
[Configuration options](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/android#configuration_options).

The Hand Landmarker supports 3 input data types: still images, video files, and
live stream. You need to specify the running mode corresponding to your
input data type when creating the task. Choose the tab corresponding to your
input data type to see how to create the task and run inference.

### Image

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
    
```

### Video

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
    
```

### Live stream

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
    
```

> [!NOTE]
> **Note:** If you use the live stream mode, you'll need to register a result listener when creating the task. The listener is called whenever the task has finished processing a video frame with the detection result and the input image as parameters.

> [!NOTE]
> **Note:** If you use the video mode or live stream mode, Hand Landmarker uses tracking to avoid triggering palm detection model on every frame, which helps reduce latency.

The Hand Landmarker example code implementation allows the user to switch between
processing modes. The approach makes the task creation code more complicated and
may not be appropriate for your use case. You can see this code in the
`setupHandLandmarker()` function in the
[`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L70-L143)
file.

### Configuration options

This task has the following configuration options for Android apps:

| Option Name | Description | Value Range | Default Value |
|---|---|---|---|
| `runningMode` | Sets the running mode for the task. There are three modes: <br /> IMAGE: The mode for single image inputs. <br /> VIDEO: The mode for decoded frames of a video. <br /> LIVE_STREAM: The mode for a livestream of input data, such as from a camera. In this mode, resultListener must be called to set up a listener to receive results asynchronously. | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `numHands` | The maximum number of hands detected by the Hand landmark detector. | `Any integer > 0` | `1` |
| `minHandDetectionConfidence` | The minimum confidence score for the hand detection to be considered successful in palm detection model. | `0.0 - 1.0` | `0.5` |
| `minHandPresenceConfidence` | The minimum confidence score for the hand presence score in the hand landmark detection model. In Video mode and Live stream mode, if the hand presence confidence score from the hand landmark model is below this threshold, Hand Landmarker triggers the palm detection model. Otherwise, a lightweight hand tracking algorithm determines the location of the hand(s) for subsequent landmark detections. | `0.0 - 1.0` | `0.5` |
| `minTrackingConfidence` | The minimum confidence score for the hand tracking to be considered successful. This is the bounding box IoU threshold between hands in the current frame and the last frame. In Video mode and Stream mode of Hand Landmarker, if the tracking fails, Hand Landmarker triggers hand detection. Otherwise, it skips the hand detection. | `0.0 - 1.0` | `0.5` |
| `resultListener` | Sets the result listener to receive the detection results asynchronously when the hand landmarker is in live stream mode. Only applicable when running mode is set to `LIVE_STREAM` | N/A | N/A |
| `errorListener` | Sets an optional error listener. | N/A | N/A |

## Prepare data

Hand Landmarker works with images, video file and live stream video. The task
handles the data input preprocessing, including resizing, rotation and value
normalization.

The following code demonstrates how to hand off data for processing. Theses
samples include details on how to handle data from images, video files, and live
video streams.

### Image

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(image).build()
    
```

### Video

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

val argb8888Frame =
    if (frame.config == Bitmap.Config.ARGB_8888) frame
    else frame.copy(Bitmap.Config.ARGB_8888, false)

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(argb8888Frame).build()
    
```

### Live stream

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
    
```

In the
Hand Landmarker example code, the data preparation is handled in the
[`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L159-L214)
file.

## Run the task

Depending on the type of data your are working with, use the
`HandLandmarker.detect...()` method that is specific to that data type. Use
`detect()` for individual images,
`detectForVideo()` for frames in video files, and
`detectAsync()` for video streams. When you are performing detections on a
video stream, make sure you run the detections on a separate thread to avoid
blocking the user interface thread.

The following code samples show simple examples of how to run Hand Landmarker
in these different data modes:

### Image

```
val result = handLandmarker?.detect(mpImage)
    
```

### Video

```
val timestampMs = i * inferenceIntervalMs

handLandmarker?.detectForVideo(mpImage, timestampMs)
    ?.let { detectionResult ->
        resultList.add(detectionResult)
    }
    
```

### Live stream

```
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

handLandmarker?.detectAsync(mpImage, frameTime)
    
```

Note the following:

- When running in the video mode or the live stream mode, you must also provide the timestamp of the input frame to the Hand Landmarker task.
- When running in the image or the video mode, the Hand Landmarker task will block the current thread until it finishes processing the input image or frame. To avoid blocking the user interface, execute the processing in a background thread.
- When running in the live stream mode, the Hand Landmarker task doesn't block the current thread but returns immediately. It will invoke its result listener with the detection result every time it has finished processing an input frame. If the detection function is called when the Hand Landmarker task is busy processing another frame, the task will ignore the new input frame.

In the
Hand Landmarker example code, the `detect`, `detectForVideo`, and
`detectAsync` functions are defined in the
[`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L159-L214)
file.

## Handle and display results

The Hand Landmarker generates a hand landmarker result object for each detection
run. The result object contains hand landmarks in image coordinates, hand
landmarks in world coordinates and handedness(left/right hand) of the detected
hands.

The following shows an example of the output data from this task:

The `HandLandmarkerResult` output contains three components. Each component is an array, where each element contains the following results for a single detected hand:

- Handedness

  Handedness represents whether the detected hands are left or right hands.
- Landmarks

  There are 21 hand landmarks, each composed of `x`, `y` and `z` coordinates. The
  `x` and `y` coordinates are normalized to \[0.0, 1.0\] by the image width and
  height, respectively. The `z` coordinate represents the landmark depth, with
  the depth at the wrist being the origin. The smaller the value, the closer the
  landmark is to the camera. The magnitude of `z` uses roughly the same scale as
  `x`.
- World Landmarks

  The 21 hand landmarks are also presented in world coordinates. Each landmark
  is composed of `x`, `y`, and `z`, representing real-world 3D coordinates in
  meters with the origin at the hand's geometric center.

    HandLandmarkerResult:
      Handedness:
        Categories #0:
          index        : 0
          score        : 0.98396
          categoryName : Left
      Landmarks:
        Landmark #0:
          x            : 0.638852
          y            : 0.671197
          z            : -3.41E-7
        Landmark #1:
          x            : 0.634599
          y            : 0.536441
          z            : -0.06984
        ... (21 landmarks for a hand)
      WorldLandmarks:
        Landmark #0:
          x            : 0.067485
          y            : 0.031084
          z            : 0.055223
        Landmark #1:
          x            : 0.063209
          y            : -0.00382
          z            : 0.020920
        ... (21 world landmarks for a hand)

The following image shows a visualization of the task output:

![A hand in a thumbs up motion with the skeletal structure of the hand mapped out](https://ai.google.dev/static/mediapipe/images/solutions/gesture-recognizer.png)

The Hand Landmarker example code demonstrates how to display the
results returned from the task, see the
[`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/OverlayView.kt)
class for more details.