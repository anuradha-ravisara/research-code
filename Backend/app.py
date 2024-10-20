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
from flask_cors import CORS

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests

# Load the pre-trained model
try:
    model = joblib.load('health_model.pkl')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading the model: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        # Prepare only the 5 features (for example, exclude fetalHeartRate)
        features = np.array([
            [
                data['age'], 
                data['bloodPressureSystolic'], 
                data['bloodPressureDiastolic'], 
                data['bmi'], 
                data['bloodSugarLevel']
            ]
        ])
        print("Features for prediction:", features)

        # Make the prediction
        prediction = model.predict(features)
        print("Prediction result:", prediction)

        # Send the result back as JSON
        return jsonify({'prediction': prediction[0]})

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