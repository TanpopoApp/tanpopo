<template>
  <div :class="$style.subscriptions">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.subscriptions.title') }}</h1>
      <b-button type="is-primary" @click="add">
        {{ $t('views.subscriptions.addSubscription') }}
      </b-button>
    </div>
    <div :class="$style.body">
      <div :class="$style.list">
        <Subscription
          v-for="sub in subscriptions"
          :key="sub.uuid"
          :subInfo="sub"
        />
      </div>
      <div :class="$style.empty" v-if="showEmpty">
        <img src="@/assets/empty.svg" width="96" alt="empty icon" />
        <p :class="$style.emptyText">
          {{ $t('views.subscriptions.emptySubscription') }}
        </p>
      </div>
    </div>
    <SubscriptionModal v-model="showAddSubscription" mode="add" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Subscription from './components/Subscription.vue';
import SubscriptionModal from './components/SubscriptionModal.vue';
import { ISubscription } from '@/store/modules/subscription';
import { namespace } from 'vuex-class';

const SubscriptionStore = namespace('subscription');

@Component({
  components: {
    SubscriptionModal,
    Subscription
  }
})
export default class Subscriptions extends Vue {
  @SubscriptionStore.State subscriptions!: Array<ISubscription>;

  showAddSubscription = false;

  get showEmpty() {
    return this.subscriptions.length === 0;
  }

  add() {
    this.showAddSubscription = true;
  }
}
</script>
<style lang="postcss" module>
.subscriptions {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.head {
  display: flex;
  justify-content: space-between;
  height: 48px;
}
.title {
  font-size: 22px;
  font-weight: 500;
}
.body {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}
.list {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: auto;
}

.empty {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  &Text {
    margin-top: 14px;
    font-size: 16px;
    color: var(--color-secondary);
  }
}
</style>
