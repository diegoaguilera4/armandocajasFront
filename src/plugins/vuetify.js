import "vuetify/styles";
import colors from 'vuetify/util/colors'
import { createVuetify } from "vuetify";
import '@mdi/font/css/materialdesignicons.css'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import es from 'vuetify/lib/locale/es'
import en from 'vuetify/lib/locale/en'
// Custom theme properties
const MiTema = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F2F5F8',
    primary: '#006398',
    secondary: colors.grey.lighten3,
    error: '#D32F2F',
    info: '#2196F3',
    exito: '#4CAF50',
    warning: '#FB8C00',
  },
};

export default createVuetify({
  components: {
    VDateInput,
    VNumberInput,
    VTimePicker,
    VFileUpload,
  },
  theme: {
    defaultTheme: "MiTema",
    themes: {
      MiTema,
    },
  },
  locale:{
    locale: 'en',
    fallback: 'en',
    messages: { en, es },
  },
  lang: {
    locales: { 
      es,
      en
    },
    current: 'es',
  },
  icons: {
    defaultSet: 'mdi',
  }
});
