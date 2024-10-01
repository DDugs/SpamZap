import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# Load your dataset
df = pd.read_csv('data.csv', sep='\t', header=None, names=['label', 'message'])  # Adjust path as necessary

# Encode labels: 'ham' as 0 and 'spam' as 1
df['label'] = df['label'].map({'ham': 0, 'spam': 1})

X = df['message']  # Column with messages
y = df['label']  # Column with labels (0 for not spam, 1 for spam)

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Convert text to numerical data
vectorizer = CountVectorizer()
X_train_vect = vectorizer.fit_transform(X_train)

# Train the model
model = LogisticRegression()
model.fit(X_train_vect, y_train)

# Evaluate the model
X_test_vect = vectorizer.transform(X_test)
y_pred = model.predict(X_test_vect)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Save the model and vectorizer
joblib.dump(model, 'spam_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
