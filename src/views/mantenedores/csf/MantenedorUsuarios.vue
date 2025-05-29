<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
            <TablaUsuarios />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import TablaUsuarios from '@/components/tablas/mantenedores/csf/TablaUsuarios.vue';
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
export default {
    components: {
        TablaUsuarios, DrawerMenu
    }
}
</script>

<style></style>