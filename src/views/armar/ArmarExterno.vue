<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <v-toolbar flat style="background-color: #006398; color: white;">
                    <v-toolbar-title>Armar externo<v-icon class="mx-2">mdi-package-variant-closed-plus</v-icon></v-toolbar-title>
                </v-toolbar>
                <TablaArmar/>
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaArmar from '@/components/tablas/armar/TablaArmar.vue';

export default {
    components: {
        DrawerMenu, TablaArmar
    },
    data: () => ({
        
    }),
    methods: {
        
    }
}
</script>

<style></style>