# # preprocess_image.py
 
# import cv2
 
# def preprocess_image(image_path):
#     """
#     Preprocess the input image to enhance text recognition accuracy.
 
#     Args:
#         image_path (str): The path to the image file to preprocess.
 
#     Returns:
#         str: The path to the processed image file.
#     """
 
#     # Read the image using OpenCV
#     image = cv2.imread(image_path)
 
#     # Convert the image to grayscale
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
 
#     # Apply GaussianBlur to reduce noise
#     blurred = cv2.GaussianBlur(gray, (5, 5), 0)
 
#     # Apply adaptive thresholding to make the text more distinct
#     processed_image = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
#                                             cv2.THRESH_BINARY, 11, 2)
 
#     # Save the processed image to disk
#     processed_image_path = 'processed_image.png'
#     cv2.imwrite(processed_image_path, processed_image)
 
#     return processed_image_path
 
# if __name__ == "__main__":
#     # Example usage
#     input_image_path = 'your_image_path_here.png'  # Replace with your image path
#     output_image_path = preprocess_image(input_image_path)
#     print(f"Processed image saved at: {output_image_path}")


# preprocess_image.py

# preprocess_image.py

import cv2
import sys  # Import sys to access command line arguments
import os  # Import os to handle paths

def preprocess_image(image_path):
    """
    Preprocess the input image to enhance text recognition accuracy.

    Args:
        image_path (str): The path to the image file to preprocess.

    Returns:
        str: The path to the processed image file.
    """

    # Read the image using OpenCV
    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(f"Could not read the image file at {image_path}. Please check the path and try again.")

    # Resize the image to a higher resolution for better text recognition
    scale_factor = 1.5  # Adjust this factor as needed
    image = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)

    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply GaussianBlur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Sharpen the image
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    sharpened = cv2.filter2D(blurred, -1, kernel)

    # Apply adaptive thresholding to make the text more distinct
    binary_image = cv2.adaptiveThreshold(sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                         cv2.THRESH_BINARY, 11, 2)

    # Apply morphological transformations to improve text shape
    morph_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    processed_image = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, morph_kernel)

    # Save the processed image to the 'uploads' directory
    processed_image_path = os.path.join('uploads', 'processed_image.png')
    cv2.imwrite(processed_image_path, processed_image)

    return processed_image_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python preprocess_image.py <image_path>")
        sys.exit(1)

    input_image_path = sys.argv[1]
    try:
        output_image_path = preprocess_image(input_image_path)
        print(f"Processed image saved at: {output_image_path}")
    except Exception as e:
        print(f"Error during image preprocessing: {e}")
        sys.exit(1)

