#!/usr/bin/env python3
"""
Setup app icons for Android from a source image.
Resizes the image to all required densities and places them in mipmap folders.
"""

from PIL import Image
import os
import shutil

# Icon sizes for different densities
ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Source image path - UPDATE THIS with your image file
SOURCE_IMAGE = r"C:\Users\Caleb Opala\OneDrive\Desktop\Sunlannd Ordering app\sunland icon.png"

# Base path to Android resources
ANDROID_RES_PATH = r"C:\Users\Caleb Opala\OneDrive\Desktop\Sunlannd Ordering app\client\android\app\src\main\res"

def setup_icons():
    """Resize and place icons in all mipmap directories."""
    
    # Check if source image exists
    if not os.path.exists(SOURCE_IMAGE):
        print(f"❌ ERROR: Source image not found at {SOURCE_IMAGE}")
        print("\nPlease save your SWG logo as 'SWG_logo.png' in the project root directory")
        print(f"Expected path: {SOURCE_IMAGE}")
        return False
    
    try:
        # Open source image
        img = Image.open(SOURCE_IMAGE).convert('RGBA')
        print(f"✓ Loaded source image: {SOURCE_IMAGE}")
        print(f"  Original size: {img.size}")
        
        # Create icons for each density
        for folder, size in ICON_SIZES.items():
            # Resize image
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Determine output path
            output_dir = os.path.join(ANDROID_RES_PATH, folder)
            
            # Save as ic_launcher.png
            ic_launcher_path = os.path.join(output_dir, 'ic_launcher.png')
            resized.save(ic_launcher_path, 'PNG')
            print(f"✓ Created {folder}/ic_launcher.png ({size}x{size})")
            
            # Also save as ic_launcher_round.png for round icon support
            ic_launcher_round_path = os.path.join(output_dir, 'ic_launcher_round.png')
            resized.save(ic_launcher_round_path, 'PNG')
            print(f"✓ Created {folder}/ic_launcher_round.png ({size}x{size})")
        
        print("\n✅ SUCCESS! App icons have been set up for all densities.")
        print("\nYour SWG logo is now ready as the app icon!")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == '__main__':
    setup_icons()
