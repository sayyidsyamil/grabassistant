import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        title: 'Grab Assistant',
        search: 'Search messages...',
      },
      input: {
        placeholder: 'Type a message...',
      },
      quickInputs: {
        '1': 'Simple text response',
        '2': 'Response with button',
        '3': 'Response with two buttons',
        '4': 'Response with graph',
      },
      messages: {
        default: "I'm an AI assistant. How can I help you today?",
        buttonClicked: 'Button {{index}} was clicked!',
        pdfDownloaded: 'PDF downloaded successfully!',
      },
    },
  },
  th: {
    translation: {
      header: {
        title: 'แกร็บ แอสซิสแทนต์',
        search: 'ค้นหาข้อความ...',
      },
      input: {
        placeholder: 'พิมพ์ข้อความ...',
      },
      quickInputs: {
        '1': 'การตอบกลับข้อความง่ายๆ',
        '2': 'การตอบกลับพร้อมปุ่ม',
        '3': 'การตอบกลับพร้อมสองปุ่ม',
        '4': 'การตอบกลับพร้อมกราฟ',
      },
      messages: {
        default: 'ฉันเป็นผู้ช่วย AI ฉันจะช่วยคุณได้อย่างไร?',
        buttonClicked: 'คลิกปุ่ม {{index}} แล้ว!',
        pdfDownloaded: 'ดาวน์โหลด PDF สำเร็จ!',
      },
    },
  },
  vi: {
    translation: {
      header: {
        title: 'Trợ lý Grab',
        search: 'Tìm kiếm tin nhắn...',
      },
      input: {
        placeholder: 'Nhập tin nhắn...',
      },
      quickInputs: {
        '1': 'Phản hồi văn bản đơn giản',
        '2': 'Phản hồi có nút',
        '3': 'Phản hồi có hai nút',
        '4': 'Phản hồi có biểu đồ',
      },
      messages: {
        default: 'Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?',
        buttonClicked: 'Đã nhấn nút {{index}}!',
        pdfDownloaded: 'Tải xuống PDF thành công!',
      },
    },
  },
  ms: {
    translation: {
      header: {
        title: 'Pembantu Grab',
        search: 'Cari mesej...',
      },
      input: {
        placeholder: 'Taip mesej...',
      },
      quickInputs: {
        '1': 'Tindak balas teks ringkas',
        '2': 'Tindak balas dengan butang',
        '3': 'Tindak balas dengan dua butang',
        '4': 'Tindak balas dengan graf',
      },
      messages: {
        default: 'Saya pembantu AI. Bagaimana saya boleh membantu anda?',
        buttonClicked: 'Butang {{index}} telah diklik!',
        pdfDownloaded: 'PDF berjaya dimuat turun!',
      },
    },
  },
  id: {
    translation: {
      header: {
        title: 'Asisten Grab',
        search: 'Cari pesan...',
      },
      input: {
        placeholder: 'Ketik pesan...',
      },
      quickInputs: {
        '1': 'Respon teks sederhana',
        '2': 'Respon dengan tombol',
        '3': 'Respon dengan dua tombol',
        '4': 'Respon dengan grafik',
      },
      messages: {
        default: 'Saya asisten AI. Bagaimana saya bisa membantu Anda?',
        buttonClicked: 'Tombol {{index}} diklik!',
        pdfDownloaded: 'PDF berhasil diunduh!',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 