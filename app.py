from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USER_DATA_PATH = os.path.join(BASE_DIR, "UserDataHistory")

# Create the directory if it doesn't exist
if not os.path.exists(USER_DATA_PATH):
    os.makedirs(USER_DATA_PATH)
    print(f"Created UserDataHistory directory at: {USER_DATA_PATH}")

def get_char_distribution(text):
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    text = text.lower()
    return [text.count(char) for char in alphabet]

def get_user_file(username):
    return os.path.join(USER_DATA_PATH, f"{username}.json")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    username = data.get('username', 'Guest')
    sentence = data.get('text', '')
    user_file = get_user_file(username)

    if not os.path.exists(user_file):
        return jsonify({"wpm": "New", "accuracy": "New"})

    with open(user_file, 'r') as f:
        history = json.load(f)

    # Filter out any old data entries that don't have the new keys
    valid_history = [h for h in history if 'y_wpm' in h and 'y_acc' in h]

    if len(valid_history) < 3:
        return jsonify({"wpm": "Wait...", "accuracy": "Wait..."})

    X = [h['x'] for h in valid_history]
    y_wpm = [h['y_wpm'] for h in valid_history]
    y_acc = [h['y_acc'] for h in valid_history]
    
    model_wpm = LinearRegression().fit(X, y_wpm)
    model_acc = LinearRegression().fit(X, y_acc)
    
    features = np.array(get_char_distribution(sentence)).reshape(1, -1)
    
    pred_wpm = model_wpm.predict(features)[0]
    pred_acc = model_acc.predict(features)[0]

    return jsonify({
        "wpm": int(max(0, pred_wpm)),
        "accuracy": int(max(0, min(100, pred_acc)))
    })

@app.route('/train', methods=['POST'])
def train():
    data = request.json
    username = data.get('username', 'Guest')
    user_file = get_user_file(username)
    
    new_entry = {
        'x': get_char_distribution(data['text']), 
        'y_wpm': data['wpm'], 
        'y_acc': data['accuracy']
    }

    history = []
    if os.path.exists(user_file):
        with open(user_file, 'r') as f:
            history = json.load(f)
    
    history.append(new_entry)
    with open(user_file, 'w') as f:
        json.dump(history, f)
        
    return jsonify({"status": "success", "count": len(history)})

if __name__ == '__main__':
    # Using 127.0.0.1 explicitly to match the JS fetch
    app.run(debug=True, host='127.0.0.1', port=5000)