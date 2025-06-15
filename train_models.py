import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras import Model
import os

# Create directories if they don't exist
os.makedirs('models/trained', exist_ok=True)

def create_model(num_classes):
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze the base model
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)  # Add dropout to prevent overfitting
    x = Dense(128, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    return model

# Data augmentation and preprocessing
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)

# Training parameters
BATCH_SIZE = 32
EPOCHS = 30
IMAGE_SIZE = (224, 224)

# Train cow model
print("Training cow model...")
cow_model = create_model(num_classes=2)

# Prepare cow datasets
cow_train_generator = train_datagen.flow_from_directory(
    'dataset/cow',
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

cow_validation_generator = train_datagen.flow_from_directory(
    'dataset/cow',
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# Compile cow model
cow_model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train cow model with callbacks
cow_callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=0.00001
    )
]

cow_history = cow_model.fit(
    cow_train_generator,
    steps_per_epoch=cow_train_generator.samples // BATCH_SIZE,
    validation_data=cow_validation_generator,
    validation_steps=cow_validation_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    callbacks=cow_callbacks,
    verbose=1
)

# Save cow model
cow_model.save('models/trained/cow_model.h5')
print("Cow model trained and saved!")

# Train dog model
print("\nTraining dog model...")
dog_model = create_model(num_classes=3)

# Prepare dog datasets
dog_train_generator = train_datagen.flow_from_directory(
    'dataset/dog',
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

dog_validation_generator = train_datagen.flow_from_directory(
    'dataset/dog',
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# Compile dog model
dog_model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train dog model with callbacks
dog_callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=0.00001
    )
]

dog_history = dog_model.fit(
    dog_train_generator,
    steps_per_epoch=dog_train_generator.samples // BATCH_SIZE,
    validation_data=dog_validation_generator,
    validation_steps=dog_validation_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    callbacks=dog_callbacks,
    verbose=1
)

# Save dog model
dog_model.save('models/trained/dog_model.h5')
print("Dog model trained and saved!")