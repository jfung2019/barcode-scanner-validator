import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isStartScan, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.container}>
        <Text style={styles.button}>Requesting for camera permission...</Text>;
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.button}>We need your permission to use the camera.</Text>
        <Button color="#0037a3" onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: BarcodeScannedEvent) => {
    setScanned(false);
    const barCodeScannedData = String(data).slice(0, -1);
    const scannedCheckDigit = String(data).charAt(String(data).length - 1);
    const INDEX_OFFSET = 1; // Adjust for 1-based indexing

    // Get odd and even position characters (1-based indexing)
    const oddPositionChars = barCodeScannedData
      .split('')
      .filter((_, idx) => (idx + INDEX_OFFSET) % 2 === 1)
      .map(Number);

    // Get odd and even position characters (1-based indexing)
    const evenPositionChars = barCodeScannedData
      .split('')
      .filter((_, idx) => (idx + INDEX_OFFSET) % 2 === 0)
      .map(Number);

    // Calculate check digit
    const sumOdd = oddPositionChars.reduce((acc, val) => acc + val, 0) * 3;
    const sumEven = evenPositionChars.reduce((acc, val) => acc + val, 0);
    const total = sumOdd + sumEven;
    // Finds the number needed to make the total a multiple of 10 and use that as the check digit
    const checkDigit = (10 - (total % 10)) % 10;
    if (Number(scannedCheckDigit) !== Number(checkDigit)) {
      Alert.alert('Barcode Invalid!', `Please provide a valid barcode or try to re-scan again.\nProvided Barcode: ${String(data)}`,
        [
          { text: 'OK', onPress: () => null },
        ]);
    } else {
      Alert.alert('Success!', `Barcode Valid! \nProvided Barcode: ${String(data)}`,
        [
          { text: 'OK', onPress: () => null },
        ]);
    }
  };

  const handleStartScan = (data: boolean) => {
    setTimeout(() => {
      setScanned(data);
    }, 1000);
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={isStartScan ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['itf14'] }}
        style={StyleSheet.absoluteFillObject}
      />
      {!isStartScan && (
        <View style={styles.button}>
          <Button color="#0037a3" title={"Tap to Scan"} onPress={() => handleStartScan(true)} />
        </View>
      )}
    </View>
  );
}

interface BarcodeScannedEvent {
  data: string;
  type?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  button: {
    textAlign: 'center',
    paddingBottom: 10
  }
});