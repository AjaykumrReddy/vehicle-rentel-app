# Razorpay Setup Instructions

## For Expo Managed Workflow:
```bash
# Razorpay doesn't work with Expo managed workflow
# You need to eject to bare workflow
expo eject
```

## For Bare React Native:
```bash
# Install package
npm install react-native-razorpay

# For React Native 0.60+
cd ios && pod install && cd ..

# Rebuild the app
npx react-native run-android
# or
npx react-native run-ios
```

## For Android (additional setup):
Add to `android/app/src/main/java/.../MainApplication.java`:
```java
import com.razorpay.rn.RazorpayPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RazorpayPackage() // Add this line
    );
}
```

## Test the setup:
```javascript
import RazorpayCheckout from 'react-native-razorpay';
console.log('Razorpay:', RazorpayCheckout); // Should not be null
```

## Alternative for Expo:
Use WebView-based payment or Expo's payment solutions.