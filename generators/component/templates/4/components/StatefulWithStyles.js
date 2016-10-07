import * as React from 'react';
import * as styles from './<%= component.styleFileName %>';

class <%= component.componentName %> extends <%= component.classBase %><{}, {}> {
  static displayName = '<%= component.componentName %>';
  static defaultProps = {};

  render() {
    return (
      <div className={styles.<%= style.className %>}>
        Please edit <%= component.path %><%= component.fileName %> to update this component!
      </div>
    );
  }
}

export default <%= component.componentName %>;
