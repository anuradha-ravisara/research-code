# # train_model.py
# import joblib
# from sklearn.linear_model import LogisticRegression
# from sklearn.model_selection import train_test_split
# from sklearn.datasets import make_classification
 
# # Example: Generate some sample data
# X, y = make_classification(n_samples=100, n_features=5, random_state=42)
 
# # Split the data into training and test sets
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
 
# # Train a simple logistic regression model
# model = LogisticRegression()
# model.fit(X_train, y_train)
 
# # Save the trained model to a file
# joblib.dump(model, 'health_model.pkl')


# import pandas as pd
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler
# from sklearn.linear_model import LogisticRegression
# import joblib

# # Hypothetical data for training
# data = {
#     'blood_pressure_systolic': [120, 130, 140, 150, 160],
#     'blood_pressure_diastolic': [80, 85, 90, 95, 100],
#     'bmi': [22.5, 24.0, 26.0, 28.0, 30.0],
#     'blood_sugar_level': [85, 90, 95, 100, 110],
#     'risk_outcome': [0, 0, 1, 1, 1]  # 1 indicates risk, 0 no risk
# }

# df = pd.DataFrame(data)

# # Define features and target
# X = df[['blood_pressure_systolic', 'blood_pressure_diastolic', 'bmi', 'blood_sugar_level']]
# y = df['risk_outcome']

# # Split the dataset
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # Scale the features
# scaler = StandardScaler()
# X_train_scaled = scaler.fit_transform(X_train)
# X_test_scaled = scaler.transform(X_test)

# # Train the model
# model = LogisticRegression()
# model.fit(X_train_scaled, y_train)

# # Save the model and scaler
# joblib.dump(model, 'health_risk_model.pkl')
# joblib.dump(scaler, 'scaler.pkl')

# print("Model and scaler saved successfully!")


import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib

# Load your dataset including the 'age' column
data = {
    'age': [25, 34, 40, 28, 55],
    'blood_pressure_systolic': [120, 150, 135, 160, 110],
    'blood_pressure_diastolic': [80, 95, 85, 100, 75],
    'bmi': [22.5, 28.0, 24.5, 30.0, 20.0],
    'blood_sugar_level': [90, 150, 110, 200, 85],
    'fetal_heart_rate': [140, 130, 145, 135, 150],
    'risk_level': [0, 1, 0, 1, 0]  # 0 = No risk, 1 = High risk
}

df = pd.DataFrame(data)

# Define features and target (now including age)
X = df[['age', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'bmi', 'blood_sugar_level', 'fetal_heart_rate']]
y = df['risk_level']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train the model
model = LogisticRegression()
model.fit(X_train_scaled, y_train)

# Save the model and scaler
joblib.dump(model, 'health_risk_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Model trained and saved successfully")


