<template>
  <v-card class="cartas">
    <v-card-title class="d-flex justify-center">
      Observaciones
    </v-card-title>
    <v-row justify="center" style="margin-top: 20px;">
      <v-col cols="12" lg="10" md="10" sm="8">
        <v-textarea
          v-model="localObservaciones"
          :rules="rules"
          label="Ingrese su observación aquí"
          variant="solo-filled"
          counter
        ></v-textarea>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'ObservacionesForm',
  props: {
    observaciones: {
      type: String,
      required: true
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    localObservaciones: {
      get() {
        return this.observaciones;
      },
      set(val) {
        this.$emit('update:observaciones', val);
      }
    }
  }
}
</script>