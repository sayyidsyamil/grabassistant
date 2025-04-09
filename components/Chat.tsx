import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, FlatList, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReplyBox from './ReplyBox'; // Make sure ReplyBox component exists and is correctly imported
import Voice from '@react-native-voice/voice';

// Grab's official color palette
const COLORS = {
  primary: '#00B14F', // Grab Green
  primaryDark: '#008A3C',
  primaryLight: '#E6F5EC',
  secondary: '#FFB800', // Grab Yellow
  background: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  border: '#E5E5E5',
  error: '#FF3B30',
  success: '#34C759',
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  buttonTexts?: string[];
  showGraph?: boolean;
  showPDF?: boolean;
  isThinking?: boolean;
}

interface Language {
  code: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const quickInputs = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
];

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', icon: 'language' },
  { code: 'th', name: 'ไทย', icon: 'language' },
  { code: 'vi', name: 'Tiếng Việt', icon: 'language' },
  { code: 'ms', name: 'Bahasa Melayu', icon: 'language' },
  { code: 'id', name: 'Bahasa Indonesia', icon: 'language' },
];

// ---- MOCK ReplyBox Component (if you don't have one) ----
// Replace this with your actual ReplyBox import if you have it
const MockReplyBox = ({ text, buttonTexts, onButtonPress, showGraph, showPDF, onPDFDownloadComplete }: any) => (
  <View style={[styles.messageContainer, styles.aiContainer]}>
    <View style={styles.aiBubble}>
      <Text style={styles.aiMessageText}>{text}</Text>
      {showGraph && <View style={styles.mockElement}><Text style={styles.mockElementText}>[Mock Graph Area]</Text></View>}
      {showPDF && <View style={styles.mockElement}><Text style={styles.mockElementText}>[Mock PDF Area]</Text><TouchableOpacity onPress={onPDFDownloadComplete}><Text style={{ color: COLORS.primary, marginTop: 5 }}>[Mock Download Complete]</Text></TouchableOpacity></View>}
      {buttonTexts && buttonTexts.length > 0 && (
        <View style={styles.buttonContainer}>
          {buttonTexts.map((buttonText: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.replyButton}
              onPress={() => onButtonPress(index)}
            >
              <Text style={styles.replyButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  </View>
);
// ---- END MOCK ReplyBox Component ----


export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // State remains, but UI removed for brevity
  const [searchQuery, setSearchQuery] = useState(''); // State remains, but UI removed for brevity
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isThinking, setIsThinking] = useState(false);
  const dotAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // --- Voice Setup ---
    Voice.onSpeechStart = () => {
      console.log('onSpeechStart');
      setIsRecording(true);
    };
    Voice.onSpeechEnd = () => {
      console.log('onSpeechEnd');
      setIsRecording(false);
      // Note: handleSend() is removed from here to avoid double sending if user also taps send.
      // User should tap send or rely on Voice.onSpeechResults to update input and then tap send.
    };
    Voice.onSpeechResults = (e) => {
      console.log('onSpeechResults:', e);
      if (e.value && e.value.length > 0) {
        setInputText(e.value[0]);
        // Optionally auto-send after result:
        // handleSend(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      console.error('onSpeechError: ', e);
      setIsRecording(false);
      // Add user feedback about the error if desired
    };
    // --- End Voice Setup ---

    // Thinking Animation Logic
    let animationLoop: Animated.CompositeAnimation | null = null;
    if (isThinking) {
        animationLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnimation, {
                    toValue: 1,
                    duration: 500, // Faster animation
                    useNativeDriver: true,
                }),
                Animated.timing(dotAnimation, {
                    toValue: 0,
                    duration: 500, // Faster animation
                    useNativeDriver: true,
                }),
            ])
        );
        animationLoop.start();
    } else {
        dotAnimation.setValue(0);
        if (animationLoop) {
            animationLoop.stop();
        }
    }

    return () => {
      // Clean up Voice listeners
      Voice.destroy().then(Voice.removeAllListeners).catch(e => console.error("Error destroying voice:", e));
      // Stop animation if component unmounts while thinking
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isThinking]); // Depend only on isThinking for animation loop setup


  const startRecording = async () => {
    // Clear previous text before starting new recording
    setInputText('');
    try {
        // Use selected language code if available, otherwise default
        const locale = selectedLanguage?.code ? `${selectedLanguage.code}-${selectedLanguage.code.toUpperCase()}` : 'en-US';
        await Voice.start(locale); // e.g., 'ms-MS' for Bahasa Melayu
        setIsRecording(true); // Ensure state is set immediately
    } catch (e) {
        console.error('Error starting speech recognition:', e);
        setIsRecording(false); // Reset state on error
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      // setIsRecording(false); // onSpeechEnd should handle this
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
      setIsRecording(false); // Ensure state is reset even if stop fails
    }
  };

  const handleSend = (textToSend?: string) => {
    const currentInput = (textToSend ?? inputText).trim(); // Use passed text or state

    if (currentInput) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: currentInput,
        isUser: true,
      };
      // Add user message and clear input immediately
      setMessages(prev => [...prev, newMessage]);
      setInputText(''); // Clear input field

      // Add thinking message
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        isThinking: true,
      };
      setMessages(prev => [...prev, thinkingMessage]);
      setIsThinking(true);

      // Simulate AI thinking delay (default 2 seconds)
      setTimeout(() => {
        setIsThinking(false);
        // Remove the thinking message before adding the actual response
        setMessages(prev => prev.filter(msg => !msg.isThinking));

        let aiResponse: Message;
        const responseId = (Date.now() + 2).toString(); // Unique ID for AI response

        // Normalize input for comparison (optional, but good practice)
        const normalizedInput = currentInput.toLowerCase();

        // --- Specific Prompts Handling ---
        if (normalizedInput === "sila bagi saya laporan prestasi minggu lepas.") {
            aiResponse = {
                id: responseId,
                text: "Here’s your performance summary for last week:\n\nTotal Revenue: RM4,800 (Up 12% from last week)\n\nTop-Selling Item: ‘Nasi Goreng’ (RM1,200 in revenue)\n\nWorst-Performing Item: ‘Mie Goreng’ (Sales dropped 15% from the previous week)\n\nPeak Sales Period: Friday, 7PM–8PM (Sales surge of 18%)\n\nTop Customer Demographics: Majority of orders from office workers aged 25-35",
                isUser: false,
                buttonTexts: ["🔍 Analyze ‘Mie Goreng’ Sales Drop", "🎯 Promote ‘Mie Goreng’ to Improve Sales"],
            };
        } else if (normalizedInput === "which item is my most profitable, and which one should i optimize?") {
            aiResponse = {
                id: responseId,
                text: "Your most profitable item is ‘Nasi Lemak’ (Profit Margin: 40%).\nYour least profitable item is ‘Mie Goreng’ (Profit Margin: 12%).",
                isUser: false,
                buttonTexts: ["📈 Increase Pricing for ‘Nasi Lemak’ to Maximize Profits", "🔧 Review ‘Mie Goreng’ Cost Breakdown"],
                // Note: PDF is mentioned as optional download, not shown inline initially
                showPDF: false,
            };
        } else if (normalizedInput === "do i have enough stock for ‘nasi goreng’ in the next 24 hours?") {
             aiResponse = {
                id: responseId,
                text: "You have 50 servings of ‘Nasi Goreng’ left.\nBased on sales data from the last 7 days, you typically sell 20 orders per day.\nYou will run out of stock by tomorrow at 3PM.",
                isUser: false,
                buttonTexts: ["📦 Restock ‘Nasi Goreng’ from Supplier", "💡 Set Reminder to Order More Stock"],
            };
        } else if (normalizedInput === "my driver pickup times have increased. can you help me identify why?") {
            aiResponse = {
                id: responseId,
                text: "Your average driver pickup time has increased by 12 minutes.\nThe peak delay occurs from 7PM–9PM, primarily due to driver shortages during those hours.\nHistorical data suggests a mismatch between order volume and available drivers.",
                isUser: false,
                buttonTexts: ["📈 Contact GrabOps to Optimize Driver Allocation", "💡 Offer Driver Incentives to Encourage Faster Pickup"],
            };
        } else if (normalizedInput === "how can i promote my top 3 items for the upcoming weekend?") {
            aiResponse = {
                id: responseId,
                text: "Your top 3 items for the weekend are ‘Nasi Goreng’, ‘Teh Tarik’, and ‘Nasi Lemak’.\nTo maximize sales, I recommend a combo deal:\n\n‘Nasi Goreng + Teh Tarik Combo: Offer at a 10% discount\n\n‘Nasi Lemak’ Special: Free delivery for orders over RM30\n\nHistorical data shows that combo offers during weekends increase sales by 15%.",
                isUser: false,
                buttonTexts: ["🎯 Set Combo Promo for ‘Nasi Goreng + Teh Tarik’", "💡 Run Free Delivery Offer for ‘Nasi Lemak’"],
                 // Note: PDF is mentioned as optional download, not shown inline initially
                showPDF: false,
            };
        }
        // --- Original Cases (1-7) ---
        else {
            switch (currentInput) { // Use the original input for these cases
            case '1':
                aiResponse = { id: responseId, text: "This is a simple text response.", isUser: false };
                break;
            case '2':
                aiResponse = { id: responseId, text: "This response includes a button!", isUser: false, buttonTexts: ["Click Me"] };
                break;
            case '3':
                aiResponse = { id: responseId, text: "This response includes two buttons!", isUser: false, buttonTexts: ["Button 1", "Button 2"] };
                break;
            case '4':
                aiResponse = { id: responseId, text: "Here's a graph with some text:", isUser: false, showGraph: true };
                break;
            case '5':
                aiResponse = { id: responseId, text: "Graph with a button:", isUser: false, showGraph: true, buttonTexts: ["View Details"] };
                break;
            case '6':
                aiResponse = { id: responseId, text: "Graph with two buttons:", isUser: false, showGraph: true, buttonTexts: ["Download", "Share"] };
                break;
            case '7':
                aiResponse = { id: responseId, text: "Here's a PDF document:", isUser: false, showPDF: true };
                break;
            default:
                aiResponse = { id: responseId, text: "I'm an AI assistant. How can I help you today?", isUser: false };
            }
        }

        // Add the actual AI response
        setMessages(prev => [...prev, aiResponse]);

        // Scroll to bottom after receiving response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2000); // Keep the 2-second thinking delay
    }
  };


  const handleQuickInput = (input: string) => {
    // Set the input text and *then* call handleSend
    // This ensures the correct text is used if handleSend reads from state
    setInputText(input);
    // Directly pass the input to handleSend for immediate processing
    handleSend(input);
  };

  const handleButtonPress = (index: number, buttonText?: string) => {
    // You can use the buttonText for more specific actions later
    const text = buttonText ? `Action triggered: "${buttonText}"` : `Button ${index + 1} was clicked!`;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true, // Simulate user action confirmation
    };
    setMessages(prev => [...prev, newMessage]);
    // Optionally, trigger another AI response based on the button click here
     setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
     }, 100);
  };

  const handlePDFDownloadComplete = () => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: "PDF downloaded successfully!",
      isUser: true, // Displayed as if user confirmed/saw the download
    };
    setMessages(prev => [...prev, newMessage]);
     setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
     }, 100);
  };

  // Removed search UI elements for brevity, but kept state/functions
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement actual search highlighting or filtering logic here
    }
  };
  const toggleSearch = () => setIsSearching(!isSearching);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    // Optionally, inform the user or change voice recognition language setting
    console.log("Language selected:", language.name);
    // If using Voice, you might want to stop/restart with the new locale
    // stopRecording(); // if recording
  };

  const renderMessage = (message: Message) => {
    if (message.isThinking) {
      const translateY = dotAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -5, 0], // Make dots jump up
      });
      return (
        <View style={[styles.messageContainer, styles.aiContainer]}>
          <View style={styles.thinkingContainer}>
            <Text style={styles.thinkingText}>Thinking</Text>
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                        opacity: dotAnimation.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.3, 1] // Fade effect
                        }),
                        transform: [{ translateY }],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      );
    }

    return message.isUser ? (
      <View key={message.id} style={[styles.messageContainer, styles.userContainer]}>
        <View style={styles.userBubble}>
          <Text style={styles.userMessageText}>{message.text}</Text>
        </View>
      </View>
    ) : (
      // Pass the button text to the handler if available
      <ReplyBox
        key={message.id}
        text={message.text}
        buttonTexts={message.buttonTexts}
        onButtonPress={(index: number) => handleButtonPress(index, message.buttonTexts?.[index])}
        showGraph={message.showGraph}
        showPDF={message.showPDF}
        onPDFDownloadComplete={handlePDFDownloadComplete}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>G</Text>
          </View>
          <Text style={styles.headerTitle}>Grab Assistant</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Ionicons name={selectedLanguage.icon} size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)} // Close on overlay press
        >
          {/* Prevent modal content press from closing */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.languageModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Language</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowLanguageModal(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <FlatList // Use FlatList for potentially long lists
                  data={LANGUAGES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item: language }) => (
                     <TouchableOpacity
                        style={[
                            styles.languageOption,
                            selectedLanguage.code === language.code && styles.selectedLanguage
                        ]}
                        onPress={() => handleLanguageSelect(language)}
                        >
                        <View style={styles.languageIconContainer}>
                            <Ionicons
                            name={language.icon}
                            size={24}
                            color={selectedLanguage.code === language.code ? COLORS.primary : COLORS.text}
                            />
                        </View>
                        <Text style={[
                            styles.languageName,
                            selectedLanguage.code === language.code && styles.selectedLanguageName
                        ]}>
                            {language.name}
                        </Text>
                        {selectedLanguage.code === language.code && (
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={styles.checkmarkIcon}/>
                        )}
                    </TouchableOpacity>
                  )}
                  style={styles.languageListContainer} // Add style for potential scroll
                />
              </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // 'height' might also work
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust offset as needed
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside input
        >
          {messages.map((message) => renderMessage(message))}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Quick Inputs (Scrollable Row) */}
           <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickInputScroll}
            contentContainerStyle={styles.quickInputContainer}
          >
            {quickInputs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickInputButton}
                onPress={() => handleQuickInput(item.label)}
              >
                <Text style={styles.quickInputText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Main Input Bar */}
          <View style={styles.inputContainer}>
             <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type or hold mic to talk..."
                placeholderTextColor={COLORS.textLight}
                multiline // Enable multiline for potentially longer inputs
                // No fixed height, let it grow naturally with max height
                maxHeight={100} // Limit growth
                onSubmitEditing={handleSend} // Send on keyboard submit button
                returnKeyType="send" // Show 'Send' on keyboard
                blurOnSubmit={false} // Keep keyboard open on send if multiline allows it
             />
            <View style={styles.actionButtons}>
               <TouchableOpacity
                style={[styles.actionButton, styles.voiceButton, isRecording && styles.voiceButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                onLongPress={startRecording} // Allow long press to start
                // onPressOut={stopRecording} // Stop when released (alternative interaction)
              >
                <Ionicons
                  name={isRecording ? "mic" : "mic-outline"}
                  size={24}
                  color={isRecording ? COLORS.background : COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.sendButton, !inputText.trim() && styles.disabledButton]} // Disable visually if no text
                onPress={() => handleSend()} // Explicitly call handleSend
                disabled={!inputText.trim()} // Actually disable the button
              >
                <Ionicons name="send" size={20} color={COLORS.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10, // Slightly reduced padding
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background, // Ensure header bg color
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Slightly reduced margin
  },
  profileText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    padding: 8, // Use padding for touch area
    marginRight: 4,
  },
  headerIcon: {
    padding: 8, // Use padding for touch area
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Ensure container bg
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 10, // Add padding at the bottom inside scrollview
  },
  messageContainer: {
    maxWidth: '85%', // Allow slightly wider bubbles
    marginBottom: 12, // Increased spacing
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18, // Slightly less rounded
    borderBottomRightRadius: 4, // Keep the tail effect
  },
  userMessageText: { // Specific style for user text
    fontSize: 15,
    color: COLORS.background,
    lineHeight: 20, // Improve readability
  },
   aiBubble: { // Style for AI text bubble
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4, // Tail effect for AI
  },
  aiMessageText: { // Specific style for AI text
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 10, // Space between text and buttons
  },
  replyButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8, // Space between buttons
    alignSelf: 'flex-start', // Align buttons to the left
  },
  replyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    paddingTop: 8, // Reduce top padding
    paddingHorizontal: 12, // Reduce horizontal padding
    paddingBottom: Platform.OS === 'ios' ? 16 : 12, // Adjust bottom padding
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to bottom for multiline input
    marginTop: 8, // Add margin from quick replies
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background, // Match section bg
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20, // Rounded corners
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8, // Adjust vertical padding for different platforms
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: COLORS.text,
    marginRight: 8,
    maxHeight: 100, // Max height before scrolling
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align with bottom of input
    paddingBottom: Platform.OS === 'ios' ? 8 : 6, // Align icons vertically with text input line
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4, // Reduced margin
  },
  voiceButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background, // Default bg
  },
  voiceButtonActive: {
    backgroundColor: COLORS.primary, // Active bg
  },
  sendButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: { // Style for disabled send button
      backgroundColor: COLORS.border, // Greyed out
  },
  quickInputScroll: {
    maxHeight: 40, // Keep height constraint
  },
  quickInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, // Add vertical padding
  },
  quickInputButton: {
    backgroundColor: COLORS.primaryLight, // Lighter background
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4, // Reduced margin
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight, // Use same color for border initially
  },
  quickInputText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary, // Use primary color for text
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Add padding to prevent modal touching edges
  },
  languageModal: {
    backgroundColor: COLORS.background,
    borderRadius: 16, // More rounded corners
    width: '100%', // Use full width within overlay padding
    maxWidth: 400,
    maxHeight: '70%', // Limit height
    overflow: 'hidden', // Clip content to border radius
    elevation: 5, // Add shadow (Android)
    shadowColor: '#000', // Add shadow (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4, // Increase touch area
  },
  languageListContainer: {
     paddingHorizontal: 8, // Add horizontal padding for list items
     paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14, // Increase padding
    borderRadius: 10, // Rounded options
    marginBottom: 8,
    backgroundColor: COLORS.background, // Default background
  },
  selectedLanguage: {
    backgroundColor: COLORS.primaryLight, // Highlight selected
  },
  languageIconContainer: {
    width: 36, // Slightly smaller icon bg
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background, // Background for icon area
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1, // Add subtle border
    borderColor: COLORS.border,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  selectedLanguageName: {
    color: COLORS.primary, // Highlight selected text
    fontWeight: '600',
  },
  checkmarkIcon: {
      marginLeft: 8, // Space before checkmark
  },
  // Thinking Indicator Styles
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight, // Use light background
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18, // Match AI bubble
    borderBottomLeftRadius: 4, // Tail effect
    alignSelf: 'flex-start',
  },
  thinkingText: {
    fontSize: 15, // Match AI text
    color: COLORS.text,
    marginRight: 6, // Space before dots
    lineHeight: 20, // Match AI text
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align dots to bottom for jump effect
    height: 10, // Fixed height container for dots
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text, // Use text color for dots
    marginHorizontal: 2,
  },
    // Mock Element Styles (for ReplyBox placeholder)
  mockElement: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockElementText: {
    color: COLORS.textLight,
    fontSize: 12,
  }
});