from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib  # Ensure joblib is installed
import os  # To check if the model file exists

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model and vectorizer
model_path = 'spam_model.pkl'  # Update with the correct path to your model
vectorizer_path = 'vectorizer.pkl'  # Update with the correct path to your vectorizer

# Check if the model and vectorizer files exist
if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    raise FileNotFoundError(f"Model file not found: {model_path}")

if os.path.exists(vectorizer_path):
    vectorizer = joblib.load(vectorizer_path)
else:
    raise FileNotFoundError(f"Vectorizer file not found: {vectorizer_path}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    message = data.get('message')

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    # Transform the message using the vectorizer
    vect = vectorizer.transform([message])
    
    # Predict if the message is spam (1) or not (0)
    is_spam = model.predict(vect)  # Ensure your model accepts the input correctly

    return jsonify({'spam': bool(is_spam[0])})  # Return True if spam, otherwise False

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
