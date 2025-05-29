<template>
  <v-card class="cartas">
    <v-card-title class="d-flex justify-center">
      TIEMPO DE PRODUCCIÓN
    </v-card-title>
    <v-row justify="center" style="margin-top: 20px;">
      <v-col cols="4" lg="2" md="2" sm="3">
        <v-text-field
          v-model="turnoLocal.horaInicio"
          :active="turnoLocal.menuInicio"
          :focused="turnoLocal.menuInicio"
          label="Inicio"
          variant="solo-filled"
          prepend-inner-icon="mdi-clock-time-four-outline"
          readonly
        >
          <v-dialog v-model="turnoLocal.menuInicio" activator="parent" width="auto">
            <v-time-picker
              v-if="turnoLocal.menuInicio"
              v-model="turnoLocal.horaInicio"
              format="24hr"
              color="#006398"
              title="Hora inicio"
            ></v-time-picker>
          </v-dialog>
        </v-text-field>
      </v-col>
      <v-col cols="4" lg="2" md="2" sm="3">
        <v-text-field
          v-model="turnoLocal.horaFin"
          :active="turnoLocal.menuFin"
          :focused="turnoLocal.menuFin"
          variant="solo-filled"
          label="Fin"
          prepend-inner-icon="mdi-clock-time-four-outline"
          readonly
        >
          <v-dialog v-model="turnoLocal.menuFin" activator="parent" width="auto">
            <v-time-picker
              v-if="turnoLocal.menuFin"
              v-model="turnoLocal.horaFin"
              format="24hr"
              color="#006398"
              title="Hora fin"
            ></v-time-picker>
          </v-dialog>
        </v-text-field>
      </v-col>
      <v-col cols="4" lg="2" md="2" sm="3">
        <v-select
          :items="['Día', 'Noche']"
          chips
          v-model="turnoLocal.turno"
          variant="solo-filled"
          label="Seleccione turno"
        ></v-select>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'TiempoProduccion',
  props: {
    turno: {
      type: Object,
      required: true
    }
  },
  computed: {
    turnoLocal: {
      get() {
        return this.turno;
      },
      set(val) {
        this.$emit('update:turno', val);
      }
    }
  }
}
</script>