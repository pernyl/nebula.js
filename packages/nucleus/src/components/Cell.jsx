import preact from 'preact';

import Grid from '@nebula.js/ui/components/Grid';
import styled from '@nebula.js/ui/components/styled';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';
import SelectionToolbar from './SelectionToolbar';

const showRequirements = (sn, layout) => {
  if (!sn || !sn.generator || !sn.generator.qae || !layout || !layout.qHyperCube) {
    return false;
  }
  const def = sn.generator.qae.data.targets[0];
  if (!def) {
    return false;
  }
  const minD = def.dimensions.min();
  const minM = def.measures.min();
  return (layout.qHyperCube.qDimensionInfo.length < minD
    || layout.qHyperCube.qMeasureInfo.length < minM);
};

const Content = ({ children }) => (
  <div style={{ position: 'relative', height: '100%' }}>
    <div
      className="nebulajs-sn"
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        bottom: '8px',
      }}
    >
      {children}
    </div>
  </div>
);

class Cell extends preact.Component {
  constructor(...args) {
    super(...args);
    this.styledClasses = ['nebulajs', ...styled({
      fontSize: '$fontSize',
      lineHeight: '$lineHeight',
      fontWeight: '400',
      fontFamily: '$fontFamily',
      color: '$grey25',
    })].join(' ');
  }

  componentDidCatch() {
    this.setState({
      error: {
        message: 'Failed to render',
      },
    });
  }

  render() {
    const {
      objectProps,
      userProps,
    } = this.props;

    const SN = (showRequirements(objectProps.sn, objectProps.layout) ? Requirements : Supernova);
    const Comp = !objectProps.sn ? Placeholder : SN;
    const err = objectProps.error || this.state.error;
    return (
      <div className={this.styledClasses} style={{ height: '100%' }}>
        {
          objectProps.sn
          && objectProps.layout.qSelectionInfo
          && objectProps.layout.qSelectionInfo.qInSelections
            && <SelectionToolbar sn={objectProps.sn} />
        }
        <Grid vertical style={{ height: '100%' }}>
          <Header layout={objectProps.layout}>&nbsp;</Header>
          <Grid.Item>
            <Content>
              {err
                ? (<CError {...err} />)
                : (
                  <Comp
                    key={objectProps.layout.visualization}
                    sn={objectProps.sn}
                    snContext={userProps.context}
                    snOptions={userProps.options}
                    layout={objectProps.layout}
                  />
                )
              }
            </Content>
          </Grid.Item>
          <Footer layout={objectProps.layout} />
        </Grid>
      </div>
    );
  }
}

export default Cell;
