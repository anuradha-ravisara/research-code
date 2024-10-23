import sys
import joblib
import numpy as np


# Load the pre-trained model and scaler with error handling
try:
    model = joblib.load('health_risk_model.pkl')
    scaler = joblib.load('scaler.pkl')
except Exception as e:
    print(f"Error loading model or scaler: {e}", file=sys.stderr)
    sys.exit(1)

def check_ranges(bp_sys, bp_dia, bmi, blood_sugar, fetal_hr):
    warnings = []
    if bmi >= 30:
        warnings.append('Obesity: Increased risk of heart disease and type 2 diabetes')
    if bp_sys >= 140 or bp_dia >= 90:
        warnings.append('Hypertension: High risk of cardiovascular disease')
    if blood_sugar >= 126:
        warnings.append('Diabetes: High risk of type 2 diabetes')
    if fetal_hr < 110 or fetal_hr > 160:
        warnings.append('Abnormal fetal heart rate: Requires medical attention')

    return warnings

def predict_risk(blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate):
    # Add a placeholder for age (or the missing feature)
    try:
        input_data = np.array([[0, blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate]])  # Placeholder for age

        # Scale the input data
        input_data_scaled = scaler.transform(input_data)

        # Make a prediction using the model
        prediction = model.predict(input_data_scaled)

        # Check for any abnormal ranges
        warnings = check_ranges(blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate)

        return prediction[0], warnings

    except Exception as e:
        print(f"Error during prediction: {e}", file=sys.stderr)
        sys.exit(1)  # Exit with an error code


if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("Error: Incorrect number of input parameters", file=sys.stderr)
        sys.exit(1)

    bp_sys = float(sys.argv[1])
    bp_dia = float(sys.argv[2])
    bmi = float(sys.argv[3])
    blood_sugar = float(sys.argv[4])
    fetal_hr = float(sys.argv[5])

    result, warnings = predict_risk(bp_sys, bp_dia, bmi, blood_sugar, fetal_hr)

    print(result)
    for warning in warnings:
        print(warning)
