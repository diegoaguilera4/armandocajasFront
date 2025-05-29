<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-container>
                <v-sheet v-if="loading" class="d-flex justify-center align-center"
                    style="background-color: transparent; border-radius: 20px; max-width: 500px; margin: auto; height: 80vh;">
                    <v-col justify="center">
                        <v-row justify="center">
                            <v-progress-circular indeterminate></v-progress-circular>
                        </v-row>
                        <v-row justify="center">
                            Cargando... por favor espere
                        </v-row>
                    </v-col>
                </v-sheet>
                <template v-if="!loading">
                    <v-card style="background-color: surface; border-radius: 20px; margin-top: -40px">
                        <v-row align="center">
                            <v-col cols="12" md="4" sm="4">
                                <v-img src="../../assets/csf.png" height="45px"
                                    style="margin-top: 20px; margin-bottom: 20px;"></v-img>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-title>INFORME DE ARMADO</v-card-title>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-text>
                                    {{ usuario.nombre }} - {{ usuario.rol }}
                                </v-card-text>
                                <v-card-text>
                                    {{ usuario.lugar }} - {{ usuario.empresa }}
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title>
                        </v-card-title>
                        <v-row justify="center">
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-number-input rounded="xl" v-model="nroFolio" :reverse="false" :min="1"
                                    controlVariant="split" label="Folio" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-locale-provider locale="es">
                                    <v-date-input v-model="fechaArmado" label="Fecha de armado" prepend-icon=""
                                        append-inner-icon="$calendar" variant="solo-filled" cancel-text="cancelar"
                                        ok-text="seleccionar"></v-date-input>
                                </v-locale-provider>
                            </v-col>
                            <v-col cols="6" lg="2" md="3" sm="4">
                                <v-locale-provider locale="es">
                                    <v-date-input v-model="fechaCreacion" label="Fecha de creación" prepend-icon=""
                                        append-inner-icon="$calendar" variant="solo-filled" disabled></v-date-input>
                                </v-locale-provider>
                            </v-col>
                        </v-row>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="data.NUMREQ" label="NV"
                                    disabled variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="data.CODITE"
                                    label="Código" disabled variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="data.RUTCLI"
                                    label="RUT Cliente" variant="solo-filled" disabled></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="data.IDECLI"
                                    label="Nombre corto" variant="solo-filled" disabled></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="data.CAN_X_ARMAR"
                                    label="Cajas por armar" variant="solo-filled" disabled></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card>

                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            RESUMEN GENERAL CAJAS
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" v-model="cajas.cajasTotales" :reverse="false"
                                    controlVariant="split" label="Cajas totales" :min="cajas.cajasBuenas + sumaMermas"
                                    :max="data.CAN_X_ARMAR" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" v-model="cajas.cajasBuenas" :reverse="false"
                                    controlVariant="split" label="Cajas buenas" :max="cajas.cajasTotales - sumaMermas"
                                    :min="0" :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-text-field v-model="mermasTotales" bg-color="grey" class="no-editable"
                                    label="Mermas totales" variant="solo-filled" disabled></v-text-field>
                            </v-col>

                        </v-row>
                        <v-divider></v-divider>
                        <v-card-title class="d-flex justify-center">
                            MERMAS
                        </v-card-title>
                        <p class="d-flex justify-center">
                            TOTAL: {{ mermasTotales }} - LLEVAS: {{ sumaMermas }} - FALTAN: {{ mermasTotales -
                                sumaMermas }}
                        </p>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasArmado"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaMaquina" controlVariant="split" label="Armado" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasFabricacion"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasAlmacenaje - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaFabricacion" controlVariant="split" label="Fabricación" :hideInput="false"
                                    inset variant="solo-filled">
                                </v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasAlmacenaje"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaPacking" controlVariant="split" label="Almacenaje" :hideInput="false"
                                    inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasTransporte"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.noPasadasMaquina"
                                    :min="sumaTransporte - cajas.noPasadasMaquina" controlVariant="split"
                                    label="Transporte" :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.noPasadasMaquina"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.mermasTransporte"
                                    :min="sumaTransporte - cajas.mermasTransporte" controlVariant="split"
                                    label="No pasadas por máquina" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeError }}
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-title class="d-flex justify-center">
                            DETALLE DE MERMAS
                        </v-card-title>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            ARMADO
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasArmado }} - LLEVAS: {{ sumaMaquina }} - FALTAN: {{ cajas.mermasArmado
                                - sumaMaquina }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.seteo" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.adhesivo - detalleMermas.maquina.trancon
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Seteo" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.adhesivo" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.trancon
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Adhesivo" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.trancon" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.adhesivo - detalleMermas.maquina.seteo
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Trancón" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.fallaMaquina" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.adhesivo
                                        - detalleMermas.maquina.trancon - detalleMermas.maquina.otrosMaquina" :min="0"
                                    controlVariant="split" label="Falla Máquina" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.otrosMaquina" :reverse="false"
                                    :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.adhesivo - detalleMermas.maquina.trancon - detalleMermas.maquina.fallaMaquina"
                                    :min="0" controlVariant="split" label="Otros" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorMaquina }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            FABRICACIÓN
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasFabricacion }} - LLEVAS: {{ sumaFabricacion }} - FALTAN: {{
                                cajas.mermasFabricacion - sumaFabricacion }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.impresion" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.troquel - this.detalleMermas.fabricacion.laminado
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Impresion"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.troquel" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.laminado
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Troquel"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.laminado" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Laminado"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.recorte" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.laminado - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Recorte"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.rayado" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.laminado - this.detalleMermas.fabricacion.recorte" :min="0" controlVariant="split" label="Rayado"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorFabricacion }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            ALMACENAJE
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasAlmacenaje }} - LLEVAS: {{ sumaPacking }} - FALTAN: {{
                                cajas.mermasAlmacenaje - sumaPacking }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.humedad" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Humedad" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.sol" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Sol" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.danioGrua" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Daño Grua" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.rotas" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Rotas" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.otrosPacking" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas"
                                    :min="0" controlVariant="split" label="Otros" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorPacking }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            TRANSPORTE
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasTransporte }} - LLEVAS: {{ sumaTransporte }} - FALTAN: {{
                                cajas.mermasTransporte - sumaTransporte }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.amarre" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Amarre" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.paletizaje" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.amarre - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Paletizaje" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.enzunchado" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.amarre - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Enzunchado" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.stretchFilm" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.amarre - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Stretch Film" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.proteccion" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.amarre"
                                    :min="0" controlVariant="split" label="Protección" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorTransporte }}
                        </v-card-text>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            MÁQUINA Y ADHESIVO
                        </v-card-title>
                        <v-row justify="center">
                            <v-switch v-model="tipoMaquina" color="primary" :label="`Máquina ${tipoMaquina}`"
                                false-value="CSF" true-value="Externa" hide-details></v-switch>
                        </v-row>
                        <!-- Máquina CSF -->
                        <div v-if="tipoMaquina === 'CSF'">
                            <v-row justify="center" style="margin-top: 20px;">
                                <v-col cols="6" lg="2" md="4" sm="4">
                                    <v-autocomplete prepend-inner-icon="mdi-engine" v-model="maquinaSeleccionada"
                                        label="N° Máquina" :items="maquinas" :item-props="itemsMaquina"
                                        variant="solo-filled">
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="6" lg="2" md="4" sm="4">
                                    <v-text-field v-model="maquinaSeleccionada.nombre" bg-color="grey"
                                        class="no-editable" label="Nombre máquina" variant="solo-filled"
                                        disabled></v-text-field>
                                </v-col>
                                <v-col cols="6" lg="2" md="4" sm="4">
                                    <v-text-field v-model="maquinaSeleccionada.marca" bg-color="grey"
                                        class="no-editable" label="Marca máquina" variant="solo-filled"
                                        disabled></v-text-field>
                                </v-col>
                                <v-col cols="6" lg="2" md="4" sm="4">
                                    <v-text-field v-model="maquinaSeleccionada.modelo" bg-color="grey"
                                        class="no-editable" label="Modelo máquina" variant="solo-filled"
                                        disabled></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="!problemaMaquina" justify="center" style="margin-bottom: 20px;">
                                <p class="text-overline">¿No encuentras la máquina?</p>
                                <v-icon color="primary" @click="dialogMaquina = true" class="ml-2">mdi-help</v-icon>
                            </v-row>
                            <v-row v-else justify="center" style="margin-bottom: 20px;">
                                <p class="text-overline">Se están mostrando todas las máquinas</p>
                                <v-icon color="warning" @click="dialogMaquina = true" class="ml-2">mdi-alert</v-icon>
                            </v-row>
                            <v-dialog v-model="dialogMaquina" max-width="650px">
                                <v-card style="border-radius: 20px; padding: 10px;">
                                    <div v-if="!problemaMaquina">
                                        <v-card-text class="text-center font-weight-bold">
                                            Al hacer click en aceptar se mostraran todas las máquinas
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error" variant="elevated"
                                                @click="closeMaquina">Cancelar</v-btn>
                                            <v-btn color="primary" variant="elevated"
                                                @click="mostrarMaquinas">Aceptar</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </div>
                                    <div v-else>
                                        <v-card-text class="text-center font-weight-bold">
                                            Al hacer click en aceptar se mostrarán solo las máquinas del lugar de armado
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error" variant="elevated"
                                                @click="closeMaquina">Cancelar</v-btn>
                                            <v-btn color="primary" variant="elevated"
                                                @click="mostrarMaquinasLugar">Aceptar</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </div>
                                </v-card>
                            </v-dialog>
                        </div>
                        <!-- Maquina externa -->
                        <div v-if="tipoMaquina === 'Externa'">
                            <v-row justify="center">
                                <v-col cols="12" lg="2" md="4" sm="6">
                                    <v-text-field v-model="maquinaExterna" label="Modelo máquina externa"
                                        variant="solo-filled"></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                        <v-divider></v-divider>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-autocomplete prepend-inner-icon="mdi-water" v-model="adhesivoSeleccionadoId"
                                    label="Adhesivo" :items="adhesivos" item-title="codigo" item-value="id"
                                    variant="solo-filled">
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props" :subtitle="item.raw.descripcion"></v-list-item>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                            <v-col cols="12" lg="3" md="3" sm="3">
                                <v-text-field v-model="adhesivoSeleccionado.descripcion" bg-color="grey"
                                    class="no-editable" label="Descripción adhesivo" variant="solo-filled"
                                    disabled></v-text-field>
                            </v-col>
                            <v-col v-if="!problemaAdhesivo" cols="6" lg="2" md="2" sm="2">
                                <v-text-field v-model="stockAdhesivo" bg-color="grey" class="no-editable" disabled
                                    label="Stock (kg)" variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="3" md="3" sm="3">
                                <v-number-input v-if="!problemaAdhesivo" v-model="adhesivoKilos" :step=".1" :min="0"
                                    control-variant="split" :max="parseFloat(stockAdhesivo)"
                                    label="Kilos adhesivo"></v-number-input>
                                <v-number-input v-else v-model="adhesivoKilos" :step=".1" :min="0"
                                    control-variant="split" label="Kilos adhesivo"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-row v-if="!problemaAdhesivo" justify="center" style="margin-bottom: 20px;">
                            <p class="text-overline">¿No encuentras el adhesivo?</p>
                            <v-icon color="primary" @click="dialogAdhesivo = true" class="ml-2">mdi-help</v-icon>
                        </v-row>
                        <v-row v-else justify="center" style="margin-bottom: 20px;">
                            <p class="text-overline">Se están mostrando todos los adhesivos</p>
                            <v-icon color="warning" @click="dialogAdhesivo = true" class="ml-2">mdi-alert</v-icon>
                        </v-row>
                        <v-dialog v-model="dialogAdhesivo" max-width="650px">
                            <v-card style="border-radius: 20px; padding: 10px;">
                                <div v-if="!problemaAdhesivo">
                                    <v-card-text class="text-center font-weight-bold">
                                        Al hacer click en aceptar se mostraran todos los adhesivos
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error" variant="elevated" @click="closeAdhesivos">Cancelar</v-btn>
                                        <v-btn color="primary" variant="elevated"
                                            @click="mostrarAdhesivos">Aceptar</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </div>
                                <div v-else>
                                    <v-card-text class="text-center font-weight-bold">
                                        Al hacer click en aceptar se mostrarán solo los adhesivos del lugar de armado
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error" variant="elevated" @click="closeAdhesivos">Cancelar</v-btn>
                                        <v-btn color="primary" variant="elevated"
                                            @click="mostrarAdhesivosLugar">Aceptar</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </div>
                            </v-card>
                        </v-dialog>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            DETENCIONES DE MÁQUINA
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;" v-for="(detencion, index) in detenciones"
                            :key="index">
                            <v-col cols="12" lg="2" md="3" sm="6">
                                <v-select :items="tiposDetencion" chips label="Tipo detención" item-title="descripcion"
                                    item-value="descripcion" v-model="detencion.tipo"></v-select>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="detencion.inicio" :active="detencion.menuInicio"
                                    :focused="detencion.menuInicio" label="Inicio"
                                    prepend-inner-icon="mdi-clock-time-four-outline" readonly>
                                    <v-dialog v-model="detencion.menuInicio" activator="parent" width="auto">
                                        <v-time-picker v-if="detencion.menuInicio" v-model="detencion.inicio"
                                            :max="detencion.fin" format="24hr" color="#006398"
                                            title="Hora inicio"></v-time-picker>
                                    </v-dialog>
                                </v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="detencion.fin" :active="detencion.menuFin"
                                    :focused="detencion.menuFin" label="Fin"
                                    prepend-inner-icon="mdi-clock-time-four-outline" readonly>
                                    <v-dialog v-model="detencion.menuFin" activator="parent" width="auto">
                                        <v-time-picker v-if="detencion.menuFin" v-model="detencion.fin"
                                            :min="detencion.inicio" format="24hr" color="#006398"
                                            title="Hora fin"></v-time-picker>
                                    </v-dialog>
                                </v-text-field>
                            </v-col>
                            <v-col cols="9" lg="4" md="3" sm="10">
                                <v-text-field v-model="detencion.observacion" label="Observación"></v-text-field>
                            </v-col>
                            <v-col lg="1">
                                <v-btn icon @click="eliminarDetencion(index)" color="error">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>

                        </v-row>
                        <v-row justify="center" style="margin-top: 30px; margin-bottom: 10px">
                            <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus"
                                @click="agregarDetencion">Agregar
                                Detención</v-btn>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            TIEMPO DE PRODUCCIÓN
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="4" lg="2" md="2" sm="3">
                                <v-text-field v-model="turno.horaInicio" :active="turno.menuInicio"
                                    :focused="turno.menuInicio" label="Inicio"
                                    prepend-inner-icon="mdi-clock-time-four-outline" readonly>
                                    <v-dialog v-model="turno.menuInicio" activator="parent" width="auto">
                                        <v-time-picker v-if="turno.menuInicio" v-model="turno.horaInicio" format="24hr"
                                            color="#006398" title="Hora inicio"></v-time-picker>
                                    </v-dialog>
                                </v-text-field>
                            </v-col>
                            <v-col cols="4" lg="2" md="2" sm="3">
                                <v-text-field v-model="turno.horaFin" :active="turno.menuFin" :focused="turno.menuFin"
                                    label="Fin" prepend-inner-icon="mdi-clock-time-four-outline" readonly>
                                    <v-dialog v-model="turno.menuFin" activator="parent" width="auto">
                                        <v-time-picker v-if="turno.menuFin" v-model="turno.horaFin" format="24hr"
                                            color="#006398" title="Hora fin"></v-time-picker>
                                    </v-dialog>
                                </v-text-field>
                            </v-col>
                            <v-col cols="4" lg="2" md="2" sm="3">
                                <v-select :items="['Día', 'Noche']" chips v-model="turno.turno"
                                    label="Seleccione turno"></v-select>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            Observaciones
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="10" md="10" sm="8">
                                <v-textarea v-model="observaciones" :rules="rules" label="Ingrese su observación aquí"
                                    counter></v-textarea>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-row justify="center" style="margin-top: 20px">
                        <v-btn color="error" @click="$router.go(-1)">Cancelar</v-btn>
                        <v-btn color="primary" style="margin-left: 10px;" @click="crearForm()">Guardar</v-btn>
                    </v-row>
                </template>
            </v-container>
        </v-main>
    </v-app>


</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import axios from 'axios';
import { ref } from 'vue';
export default {
    name: 'FormularioArmado',
    components: {
        DrawerMenu
    },
    data() {
        return {
            inicio: null,
            fin: null,
            menuInicio: false,
            menuFin: false,
            data: {},
            loading: true,
            nroFolio: null,
            folio: {},
            usuario: {
                nombre: '',
                rol: '',
                lugar: '',
                empresa: ''
            },
            maquina: {
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            },
            adhesivo: {
                marca: '',
                descripcion: ''
            },
            cajas: {
                cajasTotales: 0,
                cajasBuenas: 0,
                mermasTotales: 0,
                mermasArmado: 0,
                mermasFabricacion: 0,
                mermasAlmacenaje: 0,
                mermasTransporte: 0,
                noPasadasMaquina: 0
            },
            detalleMermas: {
                transporte: {
                    amarre: 0,
                    paletizaje: 0,
                    enzunchado: 0,
                    stretchFilm: 0,
                    proteccion: 0,
                },
                fabricacion: {
                    impresion: 0,
                    troquel: 0,
                    laminado: 0,
                    recorte: 0,
                    rayado: 0,
                },
                packing: {
                    humedad: 0,
                    sol: 0,
                    danioGrua: 0,
                    rotas: 0,
                    otrosPacking: 0,
                },
                maquina: {
                    seteo: 0,
                    adhesivo: 0,
                    trancon: 0,
                    fallaMaquina: 0,
                    otrosMaquina: 0,
                }
            },
            maquinas: [],
            maquinaSeleccionada: {
                id: 0,
                nmaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            },
            adhesivoSeleccionadoId: null,
            adhesivoSeleccionado: {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            },
            stockAdhesivo: null,
            adhesivoKilos: null,
            adhesivos: [],
            observaciones: '',
            fechaArmado: ref(new Date()),
            fechaCreacion: new Date(),
            rules: [v => v.length <= 400 || 'Máximo 400 caracteres'],
            tipo: '',
            prestadorId: 0,
            folioDisponible: false,
            colorError: 'default',
            colorErrorFabricacion: 'default',
            colorErrorPacking: 'default',
            colorErrorMaquina: 'default',
            colorErrorTransporte: 'default',
            hayError: false,
            hayErrorFabricacion: false,
            hayErrorPacking: false,
            hayErrorMaquina: false,
            hayErrorTransporte: false,
            mensajeError: '',
            mensajeErrorFabricacion: '',
            mensajeErrorPacking: '',
            mensajeErrorMaquina: '',
            mensajeErrorTransporte: '',
            tiposDetencion: [],
            detenciones: [
                { tipo: null, inicio: '', fin: '', observacion: '', menuInicio: false, menuFin: false }
            ],
            turno: {
                horaInicio: '',
                horaFin: '',
                turno: null,
                menuInicio: false,
                menuFin: false
            },
            lugarArmadoId: 0,
            adhesivosStock: [],
            maquinasTodas: [],
            adhesivosTodos: [],
            adhesivoStockLugar: [],
            maquinasLugar: [],
            dialogAdhesivo: false,
            dialogMaquina: false,
            problemaMaquina: false,
            problemaAdhesivo: false,
            armadoKardexId: 0,
            tipoMaquina: 'CSF',
            maquinaExterna: '',
        }
    },
    computed: {
        mermasTotales() {
            return this.cajas.cajasTotales - this.cajas.cajasBuenas;
        },
        sumaMermas() {
            return this.cajas.mermasArmado + this.cajas.mermasFabricacion + this.cajas.mermasAlmacenaje + this.cajas.mermasTransporte + this.cajas.noPasadasMaquina;
        },
        sumaFabricacion() {
            return this.detalleMermas.fabricacion.impresion + this.detalleMermas.fabricacion.troquel + this.detalleMermas.fabricacion.laminado + this.detalleMermas.fabricacion.recorte + this.detalleMermas.fabricacion.rayado;
        },
        sumaPacking() {
            return this.detalleMermas.packing.humedad + this.detalleMermas.packing.sol + this.detalleMermas.packing.danioGrua + this.detalleMermas.packing.rotas + this.detalleMermas.packing.otrosPacking;
        },
        sumaMaquina() {
            return this.detalleMermas.maquina.seteo + this.detalleMermas.maquina.adhesivo + this.detalleMermas.maquina.trancon + this.detalleMermas.maquina.fallaMaquina + this.detalleMermas.maquina.otrosMaquina;
        },
        sumaTransporte() {
            return this.detalleMermas.transporte.amarre + this.detalleMermas.transporte.paletizaje + this.detalleMermas.transporte.enzunchado + this.detalleMermas.transporte.stretchFilm + this.detalleMermas.transporte.proteccion;
        }
    },
    watch: {
        maquinaSeleccionada(newVal) {
            if (!newVal) {
                this.maquinaSeleccionada = {
                    id: 0,
                    nroMaquina: '',
                    nombre: '',
                    marca: '',
                    modelo: ''
                }
            }
        },
        tipoMaquina(newVal) {
            if (newVal === 'Externa') {
                this.maquinaSeleccionada = {
                    id: 0,
                    nroMaquina: '',
                    nombre: '',
                    marca: '',
                    modelo: ''
                }
            }
            else {
                this.maquinaExterna = '';
            }
        },
        adhesivoSeleccionadoId(newVal) {
            //seter adhesivoSeleccionado
            if (this.adhesivoSeleccionadoId) {
                this.adhesivoSeleccionado = this.adhesivos.find(adhesivo => adhesivo.id === newVal);
                //guardar stock de ese adhesivo
                let adhesivo = this.adhesivosStock.find(adhesivo => adhesivo.adhesivoId === newVal);
                if (!this.problemaAdhesivo) {
                    this.stockAdhesivo = adhesivo.kilosDisponibles;
                }
            }
            else {
                this.adhesivoSeleccionado = {
                    id: 0,
                    codigo: '',
                    descripcion: '',
                    descripcion2: ''
                }
                this.stockAdhesivo = null;
            }

        },
        sumaMermas() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';
            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';
            }
        },
        'cajas.cajasTotales'() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';
            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';

            }
        },
        'cajas.cajasBuenas'() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';
            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';
            }
        },
        sumaFabricacion() {
            if (this.sumaFabricacion != this.cajas.mermasFabricacion) {
                this.colorErrorFabricacion = '#FFCDD2';
                this.hayErrorFabricacion = true;
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no está correcta';
            }
            else {
                this.colorErrorFabricacion = '#C8E6C9';
                this.hayErrorFabricacion = false;
                this.mensajeErrorFabricacion = '';
            }
        },
        'cajas.mermasFabricacion'() {
            if (this.sumaFabricacion != this.cajas.mermasFabricacion) {
                this.colorErrorFabricacion = '#FFCDD2';
                this.hayErrorFabricacion = true;
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no cestá correcta';
            }
            else {
                this.colorErrorFabricacion = '#C8E6C9';
                this.hayErrorFabricacion = false;
                this.mensajeErrorFabricacion = '';
            }
        },
        sumaPacking() {
            if (this.sumaPacking != this.cajas.mermasAlmacenaje) {
                this.colorErrorPacking = '#FFCDD2';
                this.hayErrorPacking = true;
                this.mensajeErrorPacking = '**La suma de mermas de almacenaje no está correcta';
            }
            else {
                this.colorErrorPacking = '#C8E6C9';
                this.hayErrorPacking = false;
                this.mensajeErrorPacking = '';
            }
        },
        'cajas.mermasAlmacenaje'() {
            if (this.sumaPacking != this.cajas.mermasAlmacenaje) {
                this.colorErrorPacking = '#FFCDD2';
                this.hayErrorPacking = true;
                this.mensajeErrorPacking = '**La suma de mermas de almacenaje no está correcta';
            }
            else {
                this.colorErrorPacking = '#C8E6C9';
                this.hayErrorPacking = false;
                this.mensajeErrorPacking = '';
            }
        },
        sumaMaquina() {
            if (this.sumaMaquina != this.cajas.mermasArmado) {
                this.colorErrorMaquina = '#FFCDD2';
                this.hayErrorMaquina = true;
                this.mensajeErrorMaquina = '**La suma de mermas de armado no está correcta';
            }
            else {
                this.colorErrorMaquina = '#C8E6C9';
                this.hayErrorMaquina = false;
                this.mensajeErrorMaquina = '';
            }
        },
        'cajas.mermasArmado'() {
            if (this.sumaMaquina != this.cajas.mermasArmado) {
                this.colorErrorMaquina = '#FFCDD2';
                this.hayErrorMaquina = true;
                this.mensajeErrorMaquina = '**La suma de mermas de armado no está correcta';
            }
            else {
                this.colorErrorMaquina = '#C8E6C9';
                this.hayErrorMaquina = false;
                this.mensajeErrorMaquina = '';
            }
        },
        sumaTransporte() {
            if (this.sumaTransporte != (this.cajas.mermasTransporte)) {
                this.colorErrorTransporte = '#FFCDD2';
                this.hayErrorTransporte = true;
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no está correcta';
            }
            else {
                this.colorErrorTransporte = '#C8E6C9';
                this.hayErrorTransporte = false;
                this.mensajeErrorTransporte = '';

            }
        },
        'cajas.mermasTransporte'() {
            if (this.sumaTransporte != (this.cajas.mermasTransporte)) {
                this.colorErrorTransporte = '#FFCDD2';
                this.hayErrorTransporte = true;
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no está correcta';
            }
            else {
                this.colorErrorTransporte = '#C8E6C9';
                this.hayErrorTransporte = false;
                this.mensajeErrorTransporte = '';
            }
        },
    },
    async created() {
        const user = JSON.parse(localStorage.getItem('user'));
        //Verificar si existe idLugarArmado en localstorage
        if (localStorage.getItem('lugarArmado')) {
            const lugar = JSON.parse(localStorage.getItem('lugarArmado'));
            this.lugarArmadoId = lugar.id;
            this.usuario.lugar = lugar.nombre;
        }
        await this.obtenerMaquinas();
        await this.obtenerTodasMaquinas();
        await this.obtenerAdhesivos();
        await this.obtenerTodosAdhesivos();
        await this.obtenerDetenciones();
        this.usuario.empresa = user.prestador[0].prestador.nombre;
        this.prestadorId = user.prestador[0].prestadorId;
        this.usuario.nombre = user.nombre;
        this.usuario.correo = user.correo;
        this.usuario.rol = user.rol;
        if (localStorage.getItem('item')) {
            this.data = JSON.parse(localStorage.getItem('item'));
            this.tipo = localStorage.getItem('tipo');
            this.loading = false;
        }
        else {
            this.$router.go(-1);
        }
    },
    methods: {
        closeMaquina() {
            this.dialogMaquina = false;
        },
        mostrarMaquinas() {
            this.dialogMaquina = false;
            this.maquinas = this.maquinasTodas;
            this.problemaMaquina = true;
            this.maquinaSeleccionada = {
                id: 0,
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            }
        },
        mostrarMaquinasLugar() {
            this.dialogMaquina = false;
            this.maquinas = this.maquinasLugar;
            this.problemaMaquina = false;
            this.maquinaSeleccionada = {
                id: 0,
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            }
        },
        closeAdhesivos() {
            this.dialogAdhesivo = false;
        },
        mostrarAdhesivos() {
            this.dialogAdhesivo = false;
            this.adhesivos = this.adhesivosTodos;
            this.problemaAdhesivo = true;
            this.adhesivoSeleccionadoId = null;
            this.adhesivoSeleccionado = {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            }
            this.adhesivoKilos = null;
        },
        mostrarAdhesivosLugar() {
            this.dialogAdhesivo = false;
            this.adhesivos = this.adhesivoStockLugar.map(adhesivo => adhesivo.adhesivo);
            this.problemaAdhesivo = false;
            this.adhesivoSeleccionadoId = null;
            this.adhesivoSeleccionado = {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            }
            this.adhesivoKilos = null;
        },
        agregarDetencion() {
            this.detenciones.push({ tipo: null, inicio: '', fin: '', observacion: '', menuInicio: false, menuFin: false });
        },
        eliminarDetencion(index) {
            this.detenciones.splice(index, 1);
        },
        itemsMaquina(item) {
            return {
                title: item.nmaquina,
            }
        },
        itemsAdhesivo(item) {
            return {
                title: item.marca,
            }
        },
        async obtenerDetenciones() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/tipoDetencion`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.tiposDetencion = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las detenciones', error);
                });
            } catch (error) {
                console.error('Error al cargar las detenciones', error);
            }
        },
        async obtenerMaquinas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquinaLugar/lugar`, {
                    params: {
                        take: -1,
                        page: 1,
                        id: this.lugarArmadoId
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinasLugar = response.data.maquinas;
                    this.maquinasLugar = this.maquinasLugar.map(maquina => maquina.maquina);
                    this.maquinas = this.maquinasLugar;
                }).catch((error) => {
                    console.error('Error al cargar las máquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las máquinas', error);
            }
        },
        async obtenerTodasMaquinas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquina`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinasTodas = response.data;
                    //sacar maquinasLugar de maquinasTodas
                    this.maquinasTodas = this.maquinasTodas.filter(maquina => !this.maquinasLugar.some(maquinaLugar => maquinaLugar.id === maquina.id));
                }).catch((error) => {
                    console.error('Error al cargar las máquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las máquinas', error);
            }
        },
        async obtenerTodosAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivosTodos = response.data;
                    //borrar adhesivosLugar de adhesivosTodos
                    this.adhesivosTodos = this.adhesivosTodos.filter(adhesivo => !this.adhesivosStock.some(adhesivoStock => adhesivoStock.adhesivoId === adhesivo.id));
                }).catch((error) => {
                    console.error('Error al cargar los adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos', error);
            }
        },
        async obtenerAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivosLugar/${this.lugarArmadoId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivosStock = response.data;
                    this.adhesivoStockLugar = response.data;
                    //Guaradar solo los items.adhesivo
                    this.adhesivos = this.adhesivosStock.map(adhesivo => adhesivo.adhesivo);
                }).catch((error) => {
                    console.error('Error al cargar los adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos', error);
            }
        },
        // Crear array de detalle de merma para enviar al backend con el formato correcto
        crearArrayDetalle(detalleMerma) {
            const detalleMermaArray = [];
            for (const [, value] of Object.entries(detalleMerma)) {
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subValue > 0) {
                        detalleMermaArray.push({ tipo: subKey, cantidad: subValue });
                    }
                }
            }
            return detalleMermaArray;
        },
        async crearArmado(armadoKardexId) {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            const usuario = JSON.parse(localStorage.getItem('user'));
            const armado = {
                nroFolio: this.nroFolio,
                folioId: parseInt(this.folio.id),
                nv: this.data.NUMREQ,
                codCsf: this.data.CODITE,
                rutCliente: this.data.RUTCLI,
                guiaCsf: this.data.GUIA_CSF,
                cajasTotales: this.cajas.cajasTotales,
                cajasBuenas: this.cajas.cajasBuenas,
                mermasTotales: this.mermasTotales,
                mermasArmado: this.cajas.mermasArmado,
                mermasFabricacion: this.cajas.mermasFabricacion,
                mermasAlmacenaje: this.cajas.mermasAlmacenaje,
                mermasTransporte: this.cajas.mermasTransporte,
                noPasadasPorMaquina: this.cajas.noPasadasMaquina,
                maquinaId: this.tipoMaquina === 'CSF' ? this.maquinaSeleccionada.id : null,
                adhesivoId: this.adhesivoSeleccionadoId,
                observaciones: this.observaciones,
                fechaArmado: this.fechaArmado,
                fechaCreacion: this.fechaCreacion,
                lugarArmadoId: this.lugarArmadoId,
                prestadorId: this.prestadorId,
                usuarioId: usuario.id,
                armadoSaldoId: this.data.id,
                armadoKardexId: armadoKardexId,
                kilosAdhesivo: parseFloat(this.adhesivoKilos),
                horaInicioTurno: this.turno.horaInicio,
                horaFinTurno: this.turno.horaFin,
                totalHorasTurno: 0,
                totalMinutosTurno: 0,
                turno: this.turno.turno,
                minutosProduccion: 0,
                promedioCajasMinuto: 0,
                temporadaId: this.temporadaSeleccionada,
                problemaAdhesivo: this.problemaAdhesivo,
                problemaMaquina: this.problemaMaquina,
                maquinaExterna: this.tipoMaquina === 'Externa' ? this.maquinaExterna : null,
            };
            let mermas = this.crearArrayDetalle(this.detalleMermas);

            //borrar menuInicio y menuFin de detenciones
            this.detenciones.forEach(detencion => {
                delete detencion.menuInicio;
                delete detencion.menuFin;
            });
            await axios.post(`/armados`, { armado: armado, detalleMerma: mermas, detenciones: this.detenciones }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(async (response) => {
                if (response.data.message) {
                    this.$notify({
                        type: 'fallo',
                        text: response.data.message
                    });
                    return;
                }
                this.$notify({
                    type: 'exito',
                    text: 'Formulario creado correctamente'
                });
                this.$router.go(-1);
            }).catch((error) => {
                this.$notify({
                    type: 'fallo',
                    text: error.response.data.message
                });
            });
        },
        async crearForm() {
            this.loading = true;
            try {
                if (!this.validarFormulario()) {
                    return;
                }
                // Validar si el nro de folio está disponible
                //await this.validarNroFolio();
                await this.crearArmadoKardex();
                if (this.armadoKardexId === 0) {
                    this.$notify({
                        type: 'fallo',
                        text: 'Error al crear el armado kardex'
                    });
                    return;
                }
                else {
                    await this.crearArmado(this.armadoKardexId);
                }

            } catch (error) {
                console.error('Error al crear el formulario', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al crear el formulario'
                });
            } finally {
                this.loading = false;
            }

        },
        async crearArmadoKardex() {
            try {
                let armado = {
                    TARMADO: this.data.TARMADO,
                    CODREQ: this.data.CODREQ,
                    GTARMADO: this.data.GTARMADO,
                    IDLUGARARMADO: this.data.IDLUGARARMADO,
                    LUGARDEARMADO: this.data.LUGARDEARMADO,
                    CENTRO_BOD: this.data.CENTRO_BOD,
                    CIUDADES: this.data.CIUDADES,
                    REGION: this.data.REGION,
                    ZONA: this.data.ZONA,
                    OC: this.data.OC,
                    FACTURA_JDE: this.data.FACTURA_JDE,
                    NUMREQ: this.data.NUMREQ,
                    CODITE: this.data.CODITE,
                    GUIA_CSF: this.data.GUIA_CSF,
                    TGUIA: this.data.TGUIA,
                    IDECLI: this.data.IDECLI,
                    RUTCLI: this.data.RUTCLI,
                    FECHA_OPERACION: new Date().toISOString().split('T')[0],
                    TIPO_OPERACION: this.tipo,
                    TIPO: this.data.TIPO,
                    CAN_X_ARMAR: this.cajas.cajasTotales * (-1),
                    CAN_ARMADA_XDESPACHAR: this.cajas.cajasBuenas,
                    CAN_ARMADA_DESPERDICIO: this.mermasTotales,
                    USUARIO_PRESTADOR: this.usuario.correo,
                    PRESTADOR: this.usuario.empresa,
                    FECHA_HRS_OPERACION: new Date(),
                    TARMADO_GLOSA: 'Precio incluye armado Cj. (Arma CSF)',
                    PERIODO: this.data.PERIODO,
                    PRESTADORID: this.prestadorId,
                }
                let armadokardex = {
                    armado: armado,
                    CANSOL: this.data.CANSOL,
                    CANENT: this.data.CANENT,
                    CANTOT_GUIA: this.data.CANTOT_GUIA,
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/armadokardex`, armadokardex, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.armadoKardexId = response.data.id;
                }).catch(error => {
                    console.error('Error al crear el armado kardex', error);
                });
            } catch (error) {
                console.error('Error al crear el armado kardex', error);
            }

        },
        validarFormulario() {
            const validaciones = [
                {
                    condicion: this.nroFolio === null || this.nroFolio === '' || this.nroFolio === 0,
                    mensaje: 'Debe ingresar un número de folio'
                },
                {
                    condicion: this.cajas.cajasTotales === 0,
                    mensaje: 'Debe ingresar la cantidad de cajas totales'
                },
                {
                    condicion: this.hayError,
                    mensaje: 'La suma de mermas no coincide con mermas totales'
                },
                {
                    condicion: this.hayErrorFabricacion,
                    mensaje: 'La suma de mermas de fabricación no coincide con mermas de fabricación'
                },
                {
                    condicion: this.hayErrorPacking,
                    mensaje: 'La suma de mermas de packing no coincide con mermas de almacenaje'
                },
                {
                    condicion: this.hayErrorMaquina,
                    mensaje: 'La suma de mermas de máquina no coincide con mermas de armado'
                },
                {
                    condicion: this.maquinaSeleccionada.id === 0 && this.tipoMaquina === 'CSF',
                    mensaje: 'Debe seleccionar una máquina'
                },
                {
                    condicion: this.maquinaSeleccionada.nmaquina === '' && this.tipoMaquina === 'CSF',
                    mensaje: 'Debe seleccionar una máquina'
                },
                {
                    condicion: this.tipoMaquina === 'Externa' && this.maquinaExterna.trim() === '',
                    mensaje: 'Debe ingresar una máquina externa'
                },
                {
                    condicion: this.adhesivoSeleccionado.codigo === '',
                    mensaje: 'Debe seleccionar un adhesivo'
                },
                {
                    condicion: this.observaciones.trim() === '',
                    mensaje: 'Debe ingresar una observación'
                },
                {
                    condicion: !this.validarNumero(this.adhesivoKilos),
                    mensaje: 'Debe ingresar un número válido en kilos de adhesivo'
                },
                {
                    condicion: parseFloat(this.adhesivoKilos) > parseFloat(this.stockAdhesivo) && !this.problemaAdhesivo,
                    mensaje: 'Kilos de adhesivo no pueden ser mayores al stock'
                },
                //validar detenciones de maquina
                {
                    condicion: this.detenciones.some(detencion => detencion.tipo === null),
                    mensaje: 'Debe seleccionar un tipo de detención'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.inicio === ''),
                    mensaje: 'Debe ingresar una hora de inicio'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.fin === ''),
                    mensaje: 'Debe ingresar una hora de fin'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.inicio >= detencion.fin),
                    mensaje: 'La hora de inicio debe ser menor a la hora de fin'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.observacion.trim() === ''),
                    mensaje: 'Debe ingresar una observación'
                },

            ];

            for (const validacion of validaciones) {
                if (validacion.condicion) {
                    this.$notify({
                        type: 'fallo',
                        text: validacion.mensaje
                    });
                    return false;
                }
            }

            return true;
        },
        validarNumero(numero) {
            return !isNaN(numero) && numero > 0;
        }
    }
}
</script>

<style>
.cartas {
    border-radius: 20px;
    margin-top: 30px;
    padding: 20px;
}

.no-editable {
    -webkit-text-fill-color: black;
    font-weight: bold;
}
</style>