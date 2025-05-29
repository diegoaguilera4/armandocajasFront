<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
            <TablaServicioPrecios />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaServicioPrecios from '@/components/tablas/mantenedores/csf/TablaServicioPrecios.vue';
export default {
    components: {
        DrawerMenu, TablaServicioPrecios
    }
}
</script>

<style></style>