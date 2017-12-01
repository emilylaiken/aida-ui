import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Snackbar } from 'react-md'

import Layout from '../ui/Layout'
import Header, { SectionNavLink } from '../ui/Header'
import Icon from './Icon'

import * as notifActions from '../actions/notifications'

export const AppLayout = ({title, headerNavLinks, userName, children, buttonAction, buttonIcon, toasts, notifActions}) => {
  const header = (
    <Header icon={<Icon/>}
            title={title}
            userName={userName}
            logoutUrl="/logout"
            sectionNavLinks={[<SectionNavLink label="Bots" to="/b" />]}
            headerNavLinks={headerNavLinks}
            buttonAction={buttonAction} buttonIcon={buttonIcon} />
  )

  return (
    <Layout header={header}>
      {children}
      <Snackbar toasts={toasts} autohide={true} onDismiss={notifActions.dismissNotification} />
    </Layout>
  )
}

const mapStateToProps = (state) => ({
  userName: state.auth.userName,
  toasts: state.notifications.toasts
})

const mapDispatchToProps = (dispatch) => ({
  notifActions: bindActionCreators(notifActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout)
