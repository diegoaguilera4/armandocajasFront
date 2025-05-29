<template>
  <v-app>
    <notifications :duration="2000"  width="370px" position="top center" >
      <template #body="props">
        <div
          :class="['custom-template', props.item.type]"
        >
          <div class="custom-template-content">
            <div class="custom-template-title">
              {{ props.item.title }}
            </div>
            <div v-html="props.item.text"></div>
          </div>
          <div class="custom-template-close" @click="props.close">
            <v-icon large>mdi-close</v-icon>
          </div>
        </div>
      </template>
    </notifications>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  components: {
  },

  data: () => ({
    //
  }),
}
</script>

<style lang="scss">
@import "~vuetify/styles";
.custom-template {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  text-align: center;
  font-size: 12px; 
  margin: 2px; 
  margin-bottom: 3;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 7px;
  &.exito {
    background: #66BB6A;
  }

  &.warning {
    background: #FFD54F;
  }

  &.fallo {
    background: #ff4b4b;
  }

  .custom-template-close {
    flex: 0 1 auto;
    padding: 0 10px;
    opacity: 0.2;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .custom-template-content {
    padding: 20px; 
    flex: 1 0 auto;
    color: white;

    .custom-template-title {
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 20px; 
      font-weight: 600;
    }
  }
}
</style>