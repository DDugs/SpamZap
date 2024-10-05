from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import requests

app = Flask(__name__)
CORS(app)

model_path = 'spam_model.pkl'
vectorizer_path = 'vectorizer.pkl'

if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    raise FileNotFoundError(f"Model file not found: {model_path}")

if os.path.exists(vectorizer_path):
    vectorizer = joblib.load(vectorizer_path)
else:
    raise FileNotFoundError(f"Vectorizer file not found: {vectorizer_path}")

GOOGLE_SAFE_BROWSING_API_KEY = 'api_key_here' #add your api key here

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    message = data.get('message')

    if not message:
        return jsonify({'error': 'No message provided'}), 400


    vect = vectorizer.transform([message])

    is_spam = model.predict(vect)

    return jsonify({'spam': bool(is_spam[0])})


@app.route('/checkUrl', methods=['POST'])
def check_url():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    payload = {
        'client': {
            'clientId': 'ZapBrowsing',
            'clientVersion': '1.0'
        },
        'threatInfo': {
            'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING'],
            'platformTypes': ['WINDOWS', 'ANY_PLATFORM'],
            'threatEntryTypes': ['URL'],
            'threatEntries': [
                {'url': url}
            ]
        }
    }

    try:
        response = requests.post(
            f'https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}',
            json=payload
        )
        print(f"API Response Status: {response.status_code}")
        print(f"API Response Data: {response.json()}")

        if response.status_code == 200:
            threat_info = response.json()
            if 'matches' in threat_info:
                return jsonify({'malicious': True, 'details': threat_info})
            else:
                return jsonify({'malicious': False})
        else:
            return jsonify({'error': 'Failed to check URL safety', 'details': response.text}), response.status_code
    except Exception as e:
        return jsonify({'error': f"Error checking URL safety: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
