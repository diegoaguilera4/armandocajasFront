<template>
  <v-card class="cartas">
    <v-card-title class="d-flex justify-center">
      DETENCIONES DE MÁQUINA
    </v-card-title>
    <v-row justify="center" style="margin-top: 20px;" v-for="(detencion, index) in detenciones" :key="index">
      <v-col cols="12" lg="2" md="3" sm="6">
        <v-select
          :items="tiposDetencion"
          chips
          label="Tipo detención"
          item-title="descripcion"
          item-value="descripcion"
          v-model="detencion.tipo"
          variant="solo-filled"
        ></v-select>
      </v-col>
      <v-col cols="6" lg="2" md="2" sm="3">
        <v-text-field
          v-model="detencion.inicio"
          :active="detencion.menuInicio"
          :focused="detencion.menuInicio"
          label="Inicio"
          variant="solo-filled"
          prepend-inner-icon="mdi-clock-time-four-outline"
          readonly
        >
          <v-dialog v-model="detencion.menuInicio" activator="parent" width="auto">
            <v-time-picker
              v-if="detencion.menuInicio"
              v-model="detencion.inicio"
              :max="detencion.fin"
              format="24hr"
              color="#006398"
              title="Hora inicio"
            ></v-time-picker>
          </v-dialog>
        </v-text-field>
      </v-col>
      <v-col cols="6" lg="2" md="2" sm="3">
        <v-text-field
          v-model="detencion.fin"
          :active="detencion.menuFin"
          :focused="detencion.menuFin"
          label="Fin"
          variant="solo-filled"
          prepend-inner-icon="mdi-clock-time-four-outline"
          readonly
        >
          <v-dialog v-model="detencion.menuFin" activator="parent" width="auto">
            <v-time-picker
              v-if="detencion.menuFin"
              v-model="detencion.fin"
              :min="detencion.inicio"
              format="24hr"
              color="#006398"
              title="Hora fin"
            ></v-time-picker>
          </v-dialog>
        </v-text-field>
      </v-col>
      <v-col cols="9" lg="4" md="3" sm="10">
        <v-text-field v-model="detencion.observacion" label="Observación" variant="solo-filled"></v-text-field>
      </v-col>
      <v-col lg="1">
        <v-btn icon @click="$emit('eliminar', index)" color="error">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" style="margin-top: 30px; margin-bottom: 10px">
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="$emit('agregar')">
        Agregar Detención
      </v-btn>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'DetencionesMaquina',
  props: {
    detenciones: { type: Array, required: true },
    tiposDetencion: { type: Array, required: true }
  }
}
</script>