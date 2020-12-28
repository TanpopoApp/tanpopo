<template>
  <b-modal v-model="showModal">
    <div class="modal-card" :class="$style.card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ $t('views.servers.serverInfo') }}</p>
      </header>
      <section class="modal-card-body" :class="$style.add">
        <div :class="$style.addForm">
          <b-field :label="$t('views.servers.name')">
            <b-input v-model="serverInfo.name" required readonly> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.host')">
            <b-input v-model="serverInfo.host" required readonly> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.port')">
            <b-input v-model="serverInfo.port" pattern="\d+" required readonly>
            </b-input>
          </b-field>
          <b-field :label="$t('views.servers.password')">
            <b-input
              type="password"
              v-model="serverInfo.password"
              password-reveal
              required
              readonly
            >
            </b-input>
          </b-field>
        </div>
      </section>
      <footer class="modal-card-foot" :class="$style.foot">
        <button class="button is-primary" @click="showModal = false">
          {{ $t('common.ok') }}
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IServer } from '@/store/modules/server';

@Component
export default class ServerModal extends Vue {
  @Prop() readonly value!: boolean;
  @Prop() readonly serverInfo!: IServer;

  get showModal() {
    return this.value;
  }
  set showModal(val: boolean) {
    this.$emit('input', val);
  }
}
</script>
<style lang="postcss" module>
.card {
  width: 100%;
  overflow: auto;
  background-color: var(--color-white);
}
.add {
  width: 100%;
  min-height: 450px;
  display: flex;
  justify-content: center;
}
.addForm {
  max-width: 400px;
  width: 100%;
  & :global {
    .field {
      min-height: 96px;
      margin-bottom: 0;
    }
  }
}
.foot {
  display: flex;
  justify-content: center;
}
</style>
