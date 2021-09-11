import { mapState } from 'vuex'

import Controls from '@/components/controls'
import ColorGroup from '@/components/widgets/ColorGroup'

// ----------------------------------------------------------------------------

export default {
  name: 'Datasets',
  components: {
    ColorGroup,
  },
  data() {
    return {
      datasets: [],
      internalPanelState: {}, // proxyId -> expanded:bool
      subpanels: {}, // proxyId -> subpanels:[bool]
      activeSourceId: -1,
    }
  },
  computed: {
    ...mapState({
      collapseDatasetPanels: 'collapseDatasetPanels',
      panels: (state) => {
        const priorities = Object.keys(state.panels).map((n) => Number(n))
        priorities.sort((a, b) => a - b)
        return [].concat(...priorities.map((prio) => state.panels[prio]))
      },
    }),
    ...mapState('widgets', ['imageToLabelmaps']),
    panelState: {
      get() {
        const ret = []
        for (let i = 0; i < this.datasets.length; i++) {
          const id = this.datasets[i]
          if (this.internalPanelState[id]) {
            ret.push(i)
          }
        }
        return ret
      },
      set(newPanelState) {
        for (let i = 0; i < this.datasets.length; i++) {
          const id = this.datasets[i]
          this.internalPanelState[id] = newPanelState.includes(i)
        }
      },
    },
    smallScreen() {
      return this.$vuetify.breakpoint.smAndDown
    },
  },
  created() {
    Controls.forEach((control, i) => this.addPanel(control, i + 10))
  },
  mounted() {
    this.updateDatasetList()
  },
  proxyManagerHooks: {
    onProxyModified() {
      this.updateDatasetList()
    },
    onProxyCreated({ proxyGroup, proxyName }) {
      if (proxyGroup === 'Sources' && proxyName === 'TrivialProducer') {
        this.updateDatasetList()
      }
    },
    onProxyDeleted({ proxyId, proxyGroup, proxyName }) {
      if (proxyGroup === 'Sources' && proxyName === 'TrivialProducer') {
        const idx = this.datasets.indexOf(proxyId)
        if (idx > -1) {
          this.$delete(this.internalPanelState, proxyId)
          this.$delete(this.subpanels, proxyId)
          this.updateDatasetList()
        }
      }
    },
    onActiveSourceChange(source) {
      if (source) {
        this.activeSourceId = source.getProxyId()
      } else {
        this.activeSourceId = -1
      }
    },
  },
  methods: {
    updateDatasetList() {
      const sources = this.$proxyManager
        .getSources()
        .filter(
          (s) =>
            s.getProxyGroup() === 'Sources' &&
            s.getProxyName() === 'TrivialProducer'
        )
        .filter((s) => Boolean(s.getDataset()))

      for (let i = 0; i < sources.length; i++) {
        const proxy = sources[i]
        const proxyId = proxy.getProxyId()
        if (!(proxyId in this.internalPanelState)) {
          this.internalPanelState[proxyId] = !this.collapseDatasetPanels
        }
        if (!(proxyId in this.subpanels)) {
          if (this.collapseDatasetPanels) {
            this.subpanels[proxyId] = []
          } else {
            this.subpanels[proxyId] = Controls.filter((c) => c.visible(proxy))
              .map((c, j) => (c.defaultExpand ? j : -1))
              .filter((v) => v > -1)
          }
        }
      }

      this.datasets = sources.map((s) => s.getProxyId())
    },
    getSourceName(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId)
      if (proxy) {
        return proxy.getName()
      }
      return null
    },
    activateSource(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId)
      if (proxy) {
        proxy.activate()
      }
      return null
    },
    deleteDataset(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId)
      if (proxy) {
        this.$proxyManager.deleteProxy(proxy)
      }
    },
    getDatasetVisibility(sourceId) {
      const rep = this.$proxyManager
        .getRepresentations()
        .find((r) => r.getInput().getProxyId() === sourceId)
      return rep ? rep.isVisible() : false
    },
    toggleDatasetVisibility(sourceId) {
      const visible = !this.getDatasetVisibility(sourceId)
      const labelmaps = this.imageToLabelmaps[sourceId] || []
      this.$proxyManager
        .getRepresentations()
        .filter((r) => {
          const id = r.getInput().getProxyId()
          return id === sourceId || labelmaps.includes(id)
        })
        .forEach((r) => r.setVisibility(visible))
      // TODO use onProxyModified?

      this.$proxyManager.renderAllViews()
    },
    addPanel(component, priority) {
      this.$store.commit('addPanel', { component, priority })
    },
  },
}
