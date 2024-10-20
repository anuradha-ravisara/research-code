import sys
import joblib
import numpy as np

# Load the pre-trained model and scaler with error handling
try:
    model = joblib.load('health_risk_model.pkl')
    scaler = joblib.load('scaler.pkl')
except Exception as e:
    print(f"Error loading model or scaler: {e}", file=sys.stderr)
    sys.exit(1)  # Exit with an error code

def check_ranges(age, blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate):
    warnings = []

    # BMI check
    if bmi < 18.5:
        warnings.append('Underweight: Increased risk of malnutrition')
    elif 25 <= bmi < 30:
        warnings.append('Overweight: Risk of obesity-related complications')
    elif bmi >= 30:
        warnings.append('Obesity: Increased risk of heart disease and type 2 diabetes')

    # Blood Pressure check
    if blood_pressure_systolic >= 140 or blood_pressure_diastolic >= 90:
        warnings.append('Hypertension: High risk of cardiovascular disease')
    elif blood_pressure_systolic < 90 or blood_pressure_diastolic < 60:
        warnings.append('Low blood pressure: Potential risk of fainting and dizziness')

    # Blood Sugar level check
    if blood_sugar_level >= 126:
        warnings.append('Diabetes: High risk of type 2 diabetes')
    elif 100 <= blood_sugar_level < 126:
        warnings.append('Pre-diabetes: Increased risk of developing diabetes')

    # Fetal Heart Rate check
    if fetal_heart_rate < 110 or fetal_heart_rate > 160:
        warnings.append('Abnormal fetal heart rate: Requires medical attention')

    return warnings

def predict_risk(age, blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate):
    # Prepare the input for the model
    try:
        input_data = np.array([[age, blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate]])

        # Scale the input data
        input_data_scaled = scaler.transform(input_data)

        # Make a prediction using the model
        prediction = model.predict(input_data_scaled)

        # Check for any abnormal ranges
        warnings = check_ranges(age, blood_pressure_systolic, blood_pressure_diastolic, bmi, blood_sugar_level, fetal_heart_rate)

        return prediction[0], warnings

    except Exception as e:
        print(f"Error during prediction: {e}", file=sys.stderr)
        sys.exit(1)  # Exit with an error code

if __name__ == "__main__":
    try:
        # Ensure the correct number of arguments is provided
        if len(sys.argv) != 7:
            raise ValueError("Incorrect number of input parameters.")

        # Take input parameters from Node.js backend
        age = float(sys.argv[1])
        bp_sys = float(sys.argv[2])
        bp_dia = float(sys.argv[3])
        bmi = float(sys.argv[4])
        blood_sugar = float(sys.argv[5])
        fetal_hr = float(sys.argv[6])

        # Call the prediction function
        result, warnings = predict_risk(age, bp_sys, bp_dia, bmi, blood_sugar, fetal_hr)

        # Output the result and any warnings (one per line)
        print(result)
        for warning in warnings:
            print(warning)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)  # Exit with an error code




