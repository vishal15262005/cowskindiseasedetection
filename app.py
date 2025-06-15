import os
import io
from PIL import Image
from tensorflow import keras
import tensorflow as tf
import numpy as np
from flask import Flask, render_template, request, jsonify, url_for

# Suppress TensorFlow warnings
import logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
logging.getLogger('tensorflow').setLevel(logging.ERROR)

# Initialize Flask app
app = Flask(__name__)

# Global variables for models
cow_model = None
dog_model = None

def load_models():
    global cow_model, dog_model
    try:
        # Custom objects to handle compatibility
        custom_objects = {
            'DepthwiseConv2D': keras.layers.DepthwiseConv2D
        }
        
        # Load models with custom objects
        cow_model = keras.models.load_model(
            'models/trained/cow_model.h5',
            custom_objects=custom_objects,
            compile=False
        )
        dog_model = keras.models.load_model(
            'models/trained/dog_model.h5',
            custom_objects=custom_objects,
            compile=False
        )
        
        # Compile models with basic settings
        for model in [cow_model, dog_model]:
            if model is not None:
                model.compile(
                    optimizer='adam',
                    loss='categorical_crossentropy',
                    metrics=['accuracy']
                )
        
        print("Models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise

# Load models when starting the app
load_models()

def preprocess_image(image_bytes):
    try:
        # Convert bytes to image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert RGBA to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize image
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to array
        img_array = np.array(img)
        
        # Normalize pixel values
        img_array = img_array.astype(np.float32) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, 0)
        
        # Debug print
        print(f"Processed image shape: {img_array.shape}")
        print(f"Image data range: [{img_array.min()}, {img_array.max()}]")
        
        return img_array
        
    except Exception as e:
        print(f"Error in preprocess_image: {str(e)}")
        print(f"Image bytes length: {len(image_bytes)}")
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cow_detection')
def cow_detection():
    return render_template('cow_detection.html')

@app.route('/dog_detection')
def dog_detection():
    return render_template('dog_detection.html')

@app.route('/vet_appointment')
def vet_appointment():
    return render_template('vet_appointment.html')

@app.route('/health_analytics')
def health_analytics():
    return render_template('health_analytics.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    
    file = request.files['file']
    animal_type = request.args.get('animal_type')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'})
    
    try:
        # Read the image file
        img_bytes = file.read()
        print(f"Received image of size: {len(img_bytes)} bytes")
        
        img_array = preprocess_image(img_bytes)
        
        if img_array is None:
            return jsonify({'error': 'Error processing image'})
        
        # Make prediction
        if animal_type == 'cow':
            prediction = cow_model.predict(img_array, verbose=0)
            classes = ['healthy', 'lsd']
        else:  # dog
            prediction = dog_model.predict(img_array, verbose=0)
            classes = ['fungal_infection', 'healthy', 'hypersensitivity_allergy']
        
        # Debug print
        print(f"Prediction array: {prediction}")
        print(f"Predicted class: {classes[np.argmax(prediction[0])]}")
        print(f"Confidence: {float(np.max(prediction[0])):.2f}")
        
        result = {
            'prediction': classes[np.argmax(prediction[0])],
            'confidence': float(np.max(prediction[0]))
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in predict route: {str(e)}")
        return jsonify({'error': f'Error processing request: {str(e)}'})

if __name__ == '__main__':
    print("Starting server...")
    print("Access the application at: http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)