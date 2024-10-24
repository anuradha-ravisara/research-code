
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
    suggestions = []

    # BMI check
    if bmi < 18.5:
        warnings.append('Underweight: Increased risk of malnutrition and other complications')
        suggestions.append('Consider increasing caloric intake and including nutrient-dense foods in your diet.')
    elif 18.5 <= bmi < 24.9:
        warnings.append('Normal weight: Keep maintaining a healthy lifestyle')
        suggestions.append('Continue with your current lifestyle, maintain balanced nutrition and regular exercise.')
    elif 25 <= bmi < 29.9:
        warnings.append('Overweight: Increased risk of obesity-related complications')
        suggestions.append('Engage in regular physical activity and consider dietary adjustments to prevent obesity.')
    elif 30 <= bmi < 34.9:
        warnings.append('Class 1 Obesity: Increased risk of heart disease and type 2 diabetes')
        suggestions.append('Start a balanced diet and increase physical activity. Consult a nutritionist for guidance.')
    elif 35 <= bmi < 39.9:
        warnings.append('Class 2 Obesity: High risk of severe obesity-related health conditions')
        suggestions.append('Consult a healthcare provider for a structured weight-loss plan.')
    elif bmi >= 40:
        warnings.append('Class 3 Obesity (Morbid obesity): Extremely high risk of life-threatening diseases')
        suggestions.append('Seek medical intervention and explore weight-loss programs or surgery options.')

    # Blood Pressure check
    if bp_sys >= 180 or bp_dia >= 120:
        warnings.append('Hypertensive Crisis: Immediate medical attention required')
        suggestions.append('Seek emergency medical care immediately.')
    elif 140 <= bp_sys < 180 or 90 <= bp_dia < 120:
        warnings.append('Hypertension Stage 2: High risk of cardiovascular disease, requires medication')
        suggestions.append('Consult a doctor for possible medication and make lifestyle adjustments to lower blood pressure.')
    elif 130 <= bp_sys < 140 or 80 <= bp_dia < 90:
        warnings.append('Hypertension Stage 1: Early signs of hypertension, lifestyle changes recommended')
        suggestions.append('Reduce salt intake, exercise regularly, and monitor your blood pressure closely.')
    elif 120 <= bp_sys < 130 and bp_dia < 80:
        warnings.append('Elevated blood pressure: Risk of hypertension, monitor regularly')
        suggestions.append('Adopt a heart-healthy diet, limit alcohol intake, and reduce stress.')
    elif bp_sys < 90 or bp_dia < 60:
        warnings.append('Low blood pressure: Potential risk of fainting, dizziness, and shock')
        suggestions.append('Increase fluid and salt intake, and avoid sudden changes in body position.')

    # Blood Sugar level check
    if blood_sugar >= 200:
        warnings.append('Diabetes: High blood sugar levels, potential emergency (hyperglycemia)')
        suggestions.append('Seek medical advice immediately and adjust your insulin or medication dosage.')
    elif blood_sugar >= 126:
        warnings.append('Diabetes: High risk of type 2 diabetes, needs medical attention')
        suggestions.append('Adopt a low-carb diet, increase physical activity, and monitor blood sugar levels.')
    elif 100 <= blood_sugar < 126:
        warnings.append('Pre-diabetes: Increased risk of developing diabetes, lifestyle changes advised')
        suggestions.append('Implement a healthier diet, increase exercise, and monitor your blood sugar levels regularly.')
    elif blood_sugar < 70:
        warnings.append('Hypoglycemia: Low blood sugar, risk of fainting, confusion, or shock')
        suggestions.append('Increase sugar intake immediately and consult a doctor to adjust medication dosage.')

    # Fetal Heart Rate check
    if fetal_hr < 110:
        warnings.append('Low fetal heart rate: Potential distress, requires medical attention')
        suggestions.append('Consult your healthcare provider to ensure the baby is safe.')
    elif fetal_hr > 160:
        warnings.append('High fetal heart rate: Potential fetal tachycardia, monitor closely')
        suggestions.append('Monitor the fetal heart rate closely and consult a doctor for further evaluation.')
    else:
        warnings.append('Normal fetal heart rate: Within a healthy range')
        suggestions.append('Keep monitoring regularly, maintain a healthy diet, and consult your doctor if necessary.')

    return warnings, suggestions


def predict_risk(bp_sys, bp_dia, bmi, blood_sugar, fetal_hr):
    try:
        input_data = np.array([[0, bp_sys, bp_dia, bmi, blood_sugar, fetal_hr]])  # Placeholder for age
        input_data_scaled = scaler.transform(input_data)
        prediction = model.predict(input_data_scaled)
        
        # Convert prediction to a valid format
        prediction = int(prediction[0])  # Ensure prediction is an integer
        
        warnings = check_ranges(bp_sys, bp_dia, bmi, blood_sugar, fetal_hr)

        return prediction, warnings

    except Exception as e:
        print(f"Error during prediction: {e}", file=sys.stderr)
        sys.exit(1)

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
