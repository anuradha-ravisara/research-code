# from flask import Flask, request, jsonify
# import joblib
 
# app = Flask(__name__)
 
# # Load the saved model
# try:
#     model = joblib.load('health_model.pkl')
#     print("Model loaded successfully.")
# except Exception as e:
#     print(f"Error loading the model: {e}")
 
# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.get_json()
#         features = data['features']  # Extract features from the request
 
#         # Convert the features to a 2D array
#         if isinstance(features, str):
#             # If features is a single string, wrap it in a list of lists
#             features = [[features]]
#         elif isinstance(features, list):
#             # If features is already a list, convert it to a list of lists
#             features = [features]
 
#         # Make a prediction
#         prediction = model.predict(features)
#         return jsonify({'prediction': prediction.tolist()})
 
#     except Exception as e:
#         print(f"Error during prediction: {e}")
#         return "Error during prediction", 500
 
# if __name__ == '__main__':
#     app.run(port=5001)


from flask import Flask, request, jsonify
import joblib
import numpy as np
import subprocess

app = Flask(__name__)

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
        print("Received data:", data)  # Log received data

        # Extract individual features from the request body
        bp_sys = data.get('bloodPressureSystolic')
        bp_dia = data.get('bloodPressureDiastolic')
        bmi = data.get('bmi')
        blood_sugar = data.get('bloodSugarLevel')
        fetal_hr = data.get('fetalHeartRate')

        # Log the individual values for better debugging
        print(f"Sys: {bp_sys}, Dia: {bp_dia}, BMI: {bmi}, Blood Sugar: {blood_sugar}, Fetal HR: {fetal_hr}")

        # Validate that all required fields are present
        if None in [bp_sys, bp_dia, bmi, blood_sugar, fetal_hr]:
            return jsonify({'error': 'All input fields are required.'}), 400

        # Prepare the arguments for the Python script
        args = [str(bp_sys), str(bp_dia), str(bmi), str(blood_sugar), str(fetal_hr)]

        # Run the predict.py script with the required arguments
        result = subprocess.run(['python', 'predict.py'] + args, capture_output=True, text=True)

        # If an error occurred during script execution, capture it
        if result.returncode != 0:
            print(f"Error during prediction script execution: {result.stderr}")  # Log error message
            return jsonify({'error': 'Error during prediction.'}), 500

        # Split the result into prediction and warnings
        output_lines = result.stdout.splitlines()
        print(f"Script Output: {output_lines}")  # Log the output from predict.py

        prediction = output_lines[0]
        warnings = output_lines[1:]

        # Convert prediction to integer or float depending on model output
        try:
            prediction = int(prediction)  # Or float(prediction) depending on the model output type
        except ValueError:
            print(f"Invalid prediction format: {prediction}")  # Log the invalid format
            return jsonify({'error': 'Invalid prediction format.'}), 500

        # Send the prediction and warnings in the response
        return jsonify({
            'prediction': prediction,
            'warnings': warnings if warnings else 'No warnings'
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Error during prediction'}), 500

if __name__ == '__main__':
    app.run(port=5001)



# from flask import Flask, request, jsonify
# import joblib
# import numpy as np  # Import numpy for numeric conversion

# app = Flask(__name__)

# # Load the saved model
# try:
#     model = joblib.load('health_model.pkl')
#     print("Model loaded successfully.")
# except Exception as e:
#     print(f"Error loading the model: {e}")

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         # Extract data from the request
#         data = request.get_json()
#         print("Received data:", data)  # Log received data

#         features = data['features']  # Extract features from the request

#         # Convert the features to a list of numeric values
#         if isinstance(features, str):
#             # Assuming the input is a comma-separated string of numeric values
#             features = [float(x.strip()) for x in features.split(',') if x.strip().replace('.', '', 1).isdigit()]
#         elif isinstance(features, list):
#             # Convert each feature to a float if it's a list
#             features = [float(x) for x in features if isinstance(x, (int, float, str)) and str(x).replace('.', '', 1).isdigit()]

#         # Reshape the input to match the model's expected input format (e.g., 2D array)
#         features = np.array(features).reshape(1, -1)  # Convert to a 2D array for the model

#         print("Numeric features for prediction:", features)  # Log numeric features to be used for prediction

#         # Make a prediction
#         prediction = model.predict(features)
#         print("Prediction result:", prediction)  # Log the prediction result

#         return jsonify({'prediction': prediction.tolist()})

#     except Exception as e:
#         print(f"Error during prediction: {e}")
#         return "Error during prediction", 500

# if __name__ == '__main__':
#     app.run(port=5001)