import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Graph() {
  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { height: 60 }]} />
        <View style={[styles.bar, { height: 100 }]} />
        <View style={[styles.bar, { height: 40 }]} />
        <View style={[styles.bar, { height: 80 }]} />
        <View style={[styles.bar, { height: 120 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 30,
    backgroundColor: '#00B14F',
    borderRadius: 4,
  },
}); 