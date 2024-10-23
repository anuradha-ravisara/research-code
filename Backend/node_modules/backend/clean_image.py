import cv2
import numpy as np

def clean_image(input_image_path, output_image_path):
    # Load the image
    image = cv2.imread(input_image_path)
    if image is None:
        print("Error: Unable to read image file")
        return

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian Blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Use adaptive thresholding to create a binary image
    thresh = cv2.adaptiveThreshold(
        blurred, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 11, 2
    )

    # Perform morphological operations to remove noise
    kernel = np.ones((3, 3), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Save the cleaned image
    cv2.imwrite(output_image_path, cleaned)
    print(f"Cleaned image saved to {output_image_path}")

if __name__ == "__main__":
    # Replace with the paths to your input and output images
    input_image_path = 'uploads/your-pre-processed-image.jpg'  # Your pre-processed image path
    output_image_path = 'uploads/cleaned-image.jpg'  # Path to save the cleaned image

    clean_image(input_image_path, output_image_path)
