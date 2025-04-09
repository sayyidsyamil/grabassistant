import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Modal, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { ChatColors } from '../constants/chatColors';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import Pdf from 'react-native-pdf';
import PDFViewer from './PDFViewer';

interface ReplyBoxProps {
  text: string;
  buttonTexts?: string[];
  onButtonPress?: (text: string) => void;
  showGraph?: boolean;
  showPDF?: boolean;
  onPDFDownloadComplete: () => void;
}

// Enhanced chart data with more meaningful information
const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [65, 59, 80, 81, 56, 55],
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      strokeWidth: 2,
    },
    {
      data: [28, 48, 40, 19, 86, 27],
      color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
      strokeWidth: 2,
    },
  ],
  legend: ['Revenue', 'Expenses'],
};

const pieChartData = [
  {
    name: 'Food & Dining',
    population: 21500000,
    color: '#FF6B6B',
    legendFontColor: ChatColors.text,
    legendFontSize: 12,
  },
  {
    name: 'Transportation',
    population: 28000000,
    color: '#4ECDC4',
    legendFontColor: ChatColors.text,
    legendFontSize: 12,
  },
  {
    name: 'Shopping',
    population: 527612,
    color: '#45B7D1',
    legendFontColor: ChatColors.text,
    legendFontSize: 12,
  },
  {
    name: 'Entertainment',
    population: 8538000,
    color: '#96CEB4',
    legendFontColor: ChatColors.text,
    legendFontSize: 12,
  },
  {
    name: 'Utilities',
    population: 11920000,
    color: '#FFEEAD',
    legendFontColor: ChatColors.text,
    legendFontSize: 12,
  },
];

const chartConfig = {
  backgroundColor: ChatColors.background,
  backgroundGradientFrom: ChatColors.background,
  backgroundGradientTo: ChatColors.background,
  decimalPlaces: 0,
  color: (opacity = 1) => ChatColors.text,
  labelColor: (opacity = 1) => ChatColors.text,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: ChatColors.primary,
  },
  propsForLabels: {
    fontSize: 12,
  },
  fillShadowGradient: ChatColors.primary,
  fillShadowGradientOpacity: 0.1,
};

const screenWidth = Dimensions.get('window').width;

export default function ReplyBox({ 
  text, 
  buttonTexts, 
  onButtonPress, 
  showGraph, 
  showPDF,
  onPDFDownloadComplete 
}: ReplyBoxProps) {
  const [showPDFModal, setShowPDFModal] = useState(false);
  const pdfPath = 'data:application/pdf;base64,'; // Base64 encoded PDF data

  const handlePDFOpen = () => {
    setShowPDFModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{text}</Text>
        
        {showGraph && (
          <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Monthly Financial Overview</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineChartData}
                width={screenWidth * 1.2}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots
                withInnerLines
                withOuterLines
                withVerticalLines
                withHorizontalLines
                withVerticalLabels
                withHorizontalLabels
                yAxisLabel="$"
                yAxisSuffix="k"
                yAxisInterval={1}
                segments={5}
                fromZero
                withShadow
              />
            </ScrollView>
            
            <Text style={styles.graphTitle}>Expense Distribution</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PieChart
                data={pieChartData}
                width={screenWidth * 1.2}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
                hasLegend
                center={[0, 0]}
                avoidFalseZero
              />
            </ScrollView>
          </View>
        )}

        {showPDF && (
          <>
            <TouchableOpacity 
              style={styles.pdfPreviewContainer}
              onPress={handlePDFOpen}
            >
              <View style={styles.pdfPreview}>
                <View style={styles.pdfPreviewHeader}>
                  <Ionicons name="document-text" size={24} color={ChatColors.primary} />
                  <Text style={styles.pdfPreviewTitle}>Monthly Report</Text>
                </View>
                <View style={styles.pdfPreviewContent}>
                  <Text style={styles.pdfPreviewText}>Tap to view the full document</Text>
                  <Text style={styles.pdfPreviewSubtext}>Last updated: March 2024</Text>
                </View>
                <View style={styles.pdfPreviewOverlay}>
                  <Ionicons name="expand" size={24} color={ChatColors.background} />
                </View>
              </View>
            </TouchableOpacity>
            <PDFViewer 
              visible={showPDFModal}
              onClose={() => setShowPDFModal(false)}
              onDownloadComplete={onPDFDownloadComplete}
              pdfPath={pdfPath}
            />
          </>
        )}

        {buttonTexts && buttonTexts.length > 0 && (
          <View style={styles.buttonContainer}>
            {buttonTexts.map((buttonText, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index === 0 && styles.firstButton,
                  index === buttonTexts.length - 1 && styles.lastButton
                ]}
                onPress={() => onButtonPress?.(buttonText)}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    marginBottom: 8,
  },
  messageBubble: {
    backgroundColor: ChatColors.primaryLight,
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: ChatColors.text,
    marginBottom: 12,
  },
  graphContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: ChatColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ChatColors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ChatColors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 1,
    backgroundColor: ChatColors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    backgroundColor: ChatColors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  firstButton: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  lastButton: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  buttonText: {
    color: ChatColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  pdfPreviewContainer: {
    marginTop: 12,
  },
  pdfPreview: {
    backgroundColor: ChatColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ChatColors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  pdfPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ChatColors.border,
  },
  pdfPreviewTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: ChatColors.text,
  },
  pdfPreviewContent: {
    padding: 12,
  },
  pdfPreviewText: {
    fontSize: 14,
    color: ChatColors.text,
    marginBottom: 4,
  },
  pdfPreviewSubtext: {
    fontSize: 12,
    color: ChatColors.textLight,
  },
  pdfPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: ChatColors.background,
  },
  pdfModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ChatColors.border,
  },
  pdfModalCloseButton: {
    padding: 4,
  },
  pdfModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: ChatColors.text,
  },
  pdfModalActionButton: {
    padding: 4,
  },
  pdfViewer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 