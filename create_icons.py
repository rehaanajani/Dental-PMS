from PIL import Image

def generate_icons():
    # Load the logo
    img = Image.open('src/renderer/src/assets/logo.png')
    
    # We want a tight crop of the tooth + ribbon mark, excluding "Smile Forever".
    # Assuming the tooth is the top part of the image, let's just use the top 70% or something.
    # A safer approach: find the bounding box of non-transparent pixels, 
    # but we need to exclude the text at the bottom.
    
    w, h = img.size
    
    # Let's crop the top part. Based on typical logo layouts, the text is at the bottom 25-30%.
    # Crop to width=w, height=int(h * 0.7)
    cropped = img.crop((0, 0, w, int(h * 0.75)))
    
    # Now find the bounding box of the non-transparent pixels in this cropped image
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
        
    # Make it square by padding
    cw, ch = cropped.size
    size = max(cw, ch)
    
    # Create a new square image with transparent background
    square_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    
    # Paste the cropped image in the center
    offset = ((size - cw) // 2, (size - ch) // 2)
    square_img.paste(cropped, offset)
    
    # Resize to standard icon sizes
    square_img = square_img.resize((256, 256), Image.Resampling.LANCZOS)
    
    # Save as PNG
    square_img.save('resources/icon.png')
    
    # Save as ICO (multiple sizes)
    square_img.save('build/icon.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
    
if __name__ == '__main__':
    generate_icons()
    print("Icons generated.")
