from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import subprocess
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)

# Enable CORS for the entire Flask app
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# MongoDB connection
try:
    client = MongoClient("mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB")
    db = client['Node-API']
    predicted_results_collection = db['predicted_results']
    print("Connected to MongoDB!")
except Exception as e:
    print(f"MongoDB Connection Error: {e}")

# Load the saved model and scaler
try:
    model = joblib.load('health_risk_model.pkl')
    scaler = joblib.load('scaler.pkl')
    print("Model and scaler loaded successfully.")
except Exception as e:
    print(f"Error loading the model or scaler: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Extract data from the request
        data = request.get_json()
        print("Received data:", data)

        # Extract individual features from the request body
        bp_sys = data.get('bloodPressureSystolic')
        bp_dia = data.get('bloodPressureDiastolic')
        bmi = data.get('bmi')
        blood_sugar = data.get('bloodSugarLevel')
        fetal_hr = data.get('fetalHeartRate')

        # Validate that all required fields are present
        if None in [bp_sys, bp_dia, bmi, blood_sugar, fetal_hr]:
            return jsonify({'error': 'All input fields are required.'}), 400

        # Prepare the arguments for the Python script
        args = [str(bp_sys), str(bp_dia), str(bmi), str(blood_sugar), str(fetal_hr)]

        # Run the predict.py script with the required arguments
        result = subprocess.run(['python', 'predict.py'] + args, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Error during prediction script execution: {result.stderr}")
            return jsonify({'error': 'Error during prediction.'}), 500

        # Split the result into prediction, warnings, and suggestions
        output_lines = result.stdout.splitlines()
        print(f"Script Output: {output_lines}")

        # Process the prediction, warnings, and suggestions
        prediction = output_lines[0]
        warnings = output_lines[1].replace('[', '').replace(']', '').split("', '")
        suggestions = output_lines[2].replace('[', '').replace(']', '').split("', '")

        # Map the prediction to a human-readable label
        if prediction == '0':
            prediction_label = "No significant health risk"
        elif prediction == '1':
            prediction_label = "Potential health risk"
        else:
            prediction_label = "Unknown prediction"

        # Save the result to MongoDB
        try:
            new_result = {
                'bloodPressureSystolic': bp_sys,
                'bloodPressureDiastolic': bp_dia,
                'bmi': bmi,
                'bloodSugarLevel': blood_sugar,
                'fetalHeartRate': fetal_hr,
                'prediction': prediction_label,
                'warnings': warnings,
                'suggestions': suggestions,
                'createdAt': datetime.now()
            }

            insert_result = predicted_results_collection.insert_one(new_result)
            print(f"Prediction result saved successfully with ID: {insert_result.inserted_id}")

        except Exception as db_error:
            print(f"Failed to save prediction result to MongoDB: {db_error}")

        # Send the prediction label, warnings, and suggestions in the response
        return jsonify({
            'prediction': prediction_label,
            'warnings': warnings,
            'suggestions': suggestions
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Error during prediction'}), 500

if __name__ == '__main__':
    app.run(port=5001)
