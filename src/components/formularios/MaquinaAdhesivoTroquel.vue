<template>
    <v-card class="cartas">
        <v-card-title class="d-flex justify-center">
            MÁQUINA, ADHESIVO Y TROQUEL
        </v-card-title>
        <v-row justify="center">
            <v-switch v-model="tipoMaquinaLocal" color="primary" :label="`Máquina ${tipoMaquinaLocal}`"
                false-value="CSF" true-value="Externa" hide-details></v-switch>
        </v-row>
        <!-- Máquina CSF -->
        <div v-if="tipoMaquinaLocal === 'CSF'">
            <v-row justify="center" style="margin-top: 20px;">
                <v-col cols="6" lg="2" md="4" sm="4">
                    <v-autocomplete prepend-inner-icon="mdi-engine" v-model="maquinaSeleccionadaLocal"
                        label="N° Máquina" :items="maquinas" :item-props="itemsMaquina" variant="solo-filled">
                    </v-autocomplete>
                </v-col>
                <v-col cols="6" lg="2" md="4" sm="4">
                    <v-text-field v-model="maquinaSeleccionadaLocal.nombre" bg-color="grey" class="no-editable"
                        label="Nombre máquina" variant="solo-filled" disabled></v-text-field>
                </v-col>
                <v-col cols="6" lg="2" md="4" sm="4">
                    <v-text-field v-model="maquinaSeleccionadaLocal.marca" bg-color="grey" class="no-editable"
                        label="Marca máquina" variant="solo-filled" disabled></v-text-field>
                </v-col>
                <v-col cols="6" lg="2" md="4" sm="4">
                    <v-text-field v-model="maquinaSeleccionadaLocal.modelo" bg-color="grey" class="no-editable"
                        label="Modelo máquina" variant="solo-filled" disabled></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="!problemaMaquina" justify="center" style="margin-bottom: 20px;">
                <p class="text-overline">¿No encuentras la máquina?</p>
                <v-icon color="primary" @click="$emit('open-dialog-maquina')" class="ml-2">mdi-help</v-icon>
            </v-row>
            <v-row v-else justify="center" style="margin-bottom: 20px;">
                <p class="text-overline">Se están mostrando todas las máquinas</p>
                <v-icon color="warning" @click="$emit('open-dialog-maquina')" class="ml-2">mdi-alert</v-icon>
            </v-row>
        </div>
        <!-- Maquina externa -->
        <div v-if="tipoMaquinaLocal === 'Externa'">
            <v-row justify="center">
                <v-col cols="12" lg="2" md="4" sm="6">
                    <v-text-field v-model="maquinaExternaLocal" label="Modelo máquina externa"
                        variant="solo-filled"></v-text-field>
                </v-col>
            </v-row>
        </div>
        <v-divider></v-divider>
        <!-- Adhesivo -->
        <v-row justify="center">
            <v-switch v-model="tipoAdhesivoLocal" color="primary" :label="`Adhesivo ${tipoAdhesivoLocal}`"
                false-value="CSF" true-value="Externo" hide-details></v-switch>
        </v-row>
        <!-- Adhesivo CSF -->
        <div v-if="tipoAdhesivoLocal === 'CSF'">
            <v-row justify="center" style="margin-top: 20px;">
                <v-col cols="12" lg="2" md="4" sm="4">
                    <v-autocomplete prepend-inner-icon="mdi-water" v-model="adhesivoSeleccionadoIdLocal"
                        label="Adhesivo" :items="adhesivos" item-title="codigo" item-value="id" variant="solo-filled">
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props" :subtitle="item.raw.descripcion"></v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="4">
                    <v-text-field v-model="adhesivoSeleccionadoLocal.descripcion" bg-color="grey" class="no-editable"
                        label="Descripción adhesivo" variant="solo-filled" disabled></v-text-field>
                </v-col>
                <v-col v-if="!problemaAdhesivo" cols="6" lg="2" md="2" sm="2">
                    <v-text-field :model-value="stockAdhesivo" bg-color="grey" class="no-editable" disabled
                        label="Stock (kg)" variant="solo-filled"></v-text-field>
                </v-col>
                <v-col cols="6" lg="3" md="3" sm="4">
                    <v-number-input v-if="!problemaAdhesivo" v-model="adhesivoKilosLocal" :step=".1" :min="0"
                        control-variant="split" :max="parseFloat(stockAdhesivo)" rounded="xl"
                        label="Kilos adhesivo"></v-number-input>
                    <v-number-input v-else v-model="adhesivoKilosLocal" :step=".1" :min="0" rounded="xl"
                        control-variant="split" label="Kilos adhesivo"></v-number-input>
                </v-col>
                <v-col cols="6" lg="2" md="2" sm="3">
                    <v-text-field v-model="nroLoteAdhesivoLocal" label="N° lote" variant="solo-filled"></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="!problemaAdhesivo" justify="center" style="margin-bottom: 20px;">
                <p class="text-overline">¿No encuentras el adhesivo?</p>
                <v-icon color="primary" @click="$emit('open-dialog-adhesivo')" class="ml-2">mdi-help</v-icon>
            </v-row>
            <v-row v-else justify="center" style="margin-bottom: 20px;">
                <p class="text-overline">Se están mostrando todos los adhesivos</p>
                <v-icon color="warning" @click="$emit('open-dialog-adhesivo')" class="ml-2">mdi-alert</v-icon>
            </v-row>
        </div>
        <div v-if="tipoAdhesivoLocal === 'Externo'">
            <v-row justify="center">
                <v-col cols="12" lg="2" md="4" sm="4">
                    <v-text-field v-model="adhesivoExternoLocal" label="Adhesivo externo"
                        variant="solo-filled"></v-text-field>
                </v-col>
                <v-col cols="6" lg="3" md="3" sm="4">
                    <v-number-input :step=".1" :min="0" rounded="xl" v-model="adhesivoKilosLocal"
                        control-variant="split" label="Kilos adhesivo"></v-number-input>
                </v-col>
                <v-col cols="6" lg="2" md="2" sm="3">
                    <v-text-field v-model="nroLoteAdhesivoLocal" label="N° lote" variant="solo-filled"></v-text-field>
                </v-col>
            </v-row>
        </div>
        <v-divider></v-divider>
        <v-row justify="center" style="margin-top: 20px;">
            <v-col cols="12" lg="2" md="2" sm="2">
                <v-text-field v-model="nroTroquelLocal" label="N° troquel" variant="solo-filled"></v-text-field>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
export default {
    name: 'MaquinaAdhesivoTroquel',
    props: {
        tipoMaquina: String,
        maquinaSeleccionada: Object,
        maquinas: Array,
        itemsMaquina: Function,
        problemaMaquina: Boolean,
        maquinaExterna: String,
        tipoAdhesivo: String,
        adhesivoSeleccionadoId: [String, Number],
        adhesivoSeleccionado: Object,
        adhesivos: Array,
        stockAdhesivo: [String, Number],
        adhesivoKilos: [String, Number],
        nroLoteAdhesivo: String,
        problemaAdhesivo: Boolean,
        adhesivoExterno: String,
        nroTroquel: [String, Number]
    },
    emits: [
        'update:tipoMaquina',
        'update:maquinaSeleccionada',
        'update:maquinaExterna',
        'update:tipoAdhesivo',
        'update:adhesivoSeleccionadoId',
        'update:adhesivoSeleccionado',
        'update:adhesivoKilos',
        'update:nroLoteAdhesivo',
        'update:adhesivoExterno',
        'update:nroTroquel',
        'open-dialog-maquina',
        'open-dialog-adhesivo'
    ],
    computed: {
        tipoMaquinaLocal: {
            get() { return this.tipoMaquina; },
            set(val) { this.$emit('update:tipoMaquina', val); }
        },
        maquinaSeleccionadaLocal: {
            get() { return this.maquinaSeleccionada; },
            set(val) { this.$emit('update:maquinaSeleccionada', val); }
        },
        maquinaExternaLocal: {
            get() { return this.maquinaExterna; },
            set(val) { this.$emit('update:maquinaExterna', val); }
        },
        tipoAdhesivoLocal: {
            get() { return this.tipoAdhesivo; },
            set(val) { this.$emit('update:tipoAdhesivo', val); }
        },
        adhesivoSeleccionadoIdLocal: {
            get() { return this.adhesivoSeleccionadoId; },
            set(val) { this.$emit('update:adhesivoSeleccionadoId', val); }
        },
        adhesivoSeleccionadoLocal: {
            get() { return this.adhesivoSeleccionado; },
            set(val) { this.$emit('update:adhesivoSeleccionado', val); }
        },
        adhesivoKilosLocal: {
            get() { return this.adhesivoKilos; },
            set(val) { this.$emit('update:adhesivoKilos', val); }
        },
        nroLoteAdhesivoLocal: {
            get() { return this.nroLoteAdhesivo; },
            set(val) { this.$emit('update:nroLoteAdhesivo', val); }
        },
        adhesivoExternoLocal: {
            get() { return this.adhesivoExterno; },
            set(val) { this.$emit('update:adhesivoExterno', val); }
        },
        nroTroquelLocal: {
            get() { return this.nroTroquel; },
            set(val) { this.$emit('update:nroTroquel', val); }
        }
    }
}
</script>