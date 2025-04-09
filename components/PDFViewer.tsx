import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatColors } from '../constants/chatColors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

interface PDFViewerProps {
  visible: boolean;
  onClose: () => void;
  onDownloadComplete: () => void;
  pdfPath: string; // Base64 encoded PDF data
}

export default function PDFViewer({ visible, onClose, onDownloadComplete, pdfPath }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, create a download link from base64
        const link = document.createElement('a');
        link.href = pdfPath;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For native, save the base64 data to a file and share it
        const filename = FileSystem.documentDirectory + 'document.pdf';
        await FileSystem.writeAsStringAsync(filename, pdfPath.split(',')[1], {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(filename, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF',
        });
      }
      onDownloadComplete();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={ChatColors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Document Viewer</Text>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={24} color={ChatColors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ChatColors.primary} />
            <Text style={styles.loadingText}>Loading document...</Text>
          </View>
        )}

        {Platform.OS === 'web' ? (
          <iframe 
            src={pdfPath}
            style={styles.pdfViewer}
            title="PDF Viewer"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <View style={styles.nativeContainer}>
            <Text style={styles.nativeText}>
              Opening document in your browser...
            </Text>
            <TouchableOpacity 
              style={styles.openButton}
              onPress={() => {
                Linking.openURL(pdfPath);
                onClose();
              }}
            >
              <Text style={styles.openButtonText}>Open Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChatColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ChatColors.border,
    backgroundColor: ChatColors.background,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: ChatColors.text,
  },
  downloadButton: {
    padding: 8,
  },
  pdfViewer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ChatColors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: ChatColors.text,
  },
  nativeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: ChatColors.background,
  },
  nativeText: {
    fontSize: 16,
    color: ChatColors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  openButton: {
    backgroundColor: ChatColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  openButtonText: {
    color: ChatColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
}); 