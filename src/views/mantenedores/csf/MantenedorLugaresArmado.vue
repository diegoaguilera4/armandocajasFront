<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <tabla-lugares-armado />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaLugaresArmado from '@/components/tablas/mantenedores/csf/TablaLugaresArmado.vue';
export default {
    components: {
        DrawerMenu, TablaLugaresArmado
    }
}
</script>

<style></style>