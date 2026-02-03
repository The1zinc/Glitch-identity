from PIL import Image, ImageDraw

# Create a black 200x200 image
img = Image.new('RGB', (200, 200), color = (0, 0, 0))
d = ImageDraw.Draw(img)

# Save
img.save('public/splash.png')
print("Created public/splash.png")
