import React, { Component } from 'react'
import { FontIcon,
         DialogContainer,
         Button,
         TextField,
         ListItem,
         DropdownMenu,
         Menu,
} from 'react-md'
import SideBar, { SidebarItem, SidebarMenuItem } from '../ui/SideBar'

import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import sortBy from 'lodash/sortBy'
import includes from 'lodash/includes'

import * as routes from '../utils/routes'
import { blank } from '../utils/string'
import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'

const SKILL_KINDS = ['language_detector', 'keyword_responder', 'survey', 'scheduled_messages', 'decision_tree']
const RENAMEABLE_SKILLS = ['keyword_responder', 'survey', 'scheduled_messages', 'decision_tree']

const skillIcon = (kind) => {
  switch (kind) {
    case 'front_desk':
      return 'chat'
    case 'language_detector':
      return 'language'
    case 'keyword_responder':
      return 'reply'
    case 'survey':
      return 'assignment_turned_in'
    case 'scheduled_messages':
      return 'query_builder'
    case 'decision_tree':
      return 'device_hub'
    case 'ADD':
      return 'add'
  }
}

const defaultSkillName = (kind) => {
  switch (kind) {
    case 'language_detector':
      return 'Language detector'
    case 'keyword_responder':
      return 'Keyword responder'
    case 'survey':
      return 'Survey'
    case 'scheduled_messages':
      return 'Scheduled messages'
    case 'decision_tree':
      return 'Decision tree'
  }
}

const skillDescription = (kind) => {
  switch (kind) {
    case 'keyword_responder':
      return 'This skill will let your users query for information using simple keywords'
    case 'survey':
      return 'This skill will let you examine users opinions'
    case 'scheduled_messages':
      return 'This skill will let you send messages automatically on a schedule'
    case 'decision_tree':
      return 'This skill will guide the user for diagnostic purposes or information access'
    default:
      return ''
  }
}

const isSkillRenameable = (kind) => includes(RENAMEABLE_SKILLS, kind)


const SkillListItem = ({skill, active, onClick, onToggleSkill, onDeleteSkill, onRenameSkill}) => {
  let actionItems = []
  if (isSkillRenameable(skill.kind)) {
    actionItems.push(<SidebarMenuItem key={0}
                               icon="edit"
                               label="Rename"
                               onClick={() => onRenameSkill(skill)} />)
  }
  actionItems.push(<SidebarMenuItem key={1}
                             icon="close"
                             label="Delete"
                             onClick={() => onDeleteSkill(skill)}/>)

  const relevant = skill.config.relevant && !blank(skill.config.relevant)

  return (<SidebarItem id={`skill-${skill.id}`}
    icon={skillIcon(skill.kind)} label={skill.name}
    enabled={skill.enabled} active={active}
    className={`skill-item ${relevant ? "skill-item-relevant" : ""}`}
    onClick={onClick} onToggle={onToggleSkill} menuItems={actionItems} />)
}

class SkillNameDialog extends Component {
  state = {
    name: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const name = nextProps.skill && (nextProps.skill.name || defaultSkillName(nextProps.skill.kind))
      this.setState({name})
    }
  }

  render() {
    const { visible, skill, onClose, onSubmit } = this.props
    const isNewSkill = !skill || !skill.id
    const kind = skill && skill.kind

    const actions = [
      { primary: true, children: 'Cancel', onClick: onClose },
      (<Button flat secondary onClick={() => onSubmit(this.state.name)}>{isNewSkill ? 'Add' : 'Rename'}</Button>)
    ]
    const dialogTitle = isNewSkill ? (defaultSkillName(kind) || 'Add skill') : 'Rename skill'
    const dialogDescription = isNewSkill ? skillDescription(kind) : ''

    return (
      <DialogContainer
        id="skill-name-dialog"
        visible={visible}
        onHide={onClose}
        actions={actions}
        title={dialogTitle}>
        <h4>{dialogDescription}</h4>
        <TextField id="skill-name-field"
                   label="Skill name"
                   value={this.state.name}
                   onChange={(name) => this.setState({name})} />
      </DialogContainer>
    )
  }
}

class SkillsBar extends Component {
  state = {
    dialogSkill: null
  }

  componentDidMount() {
    const { skills, bot, actions } = this.props
    if (!skills) {
      actions.fetchSkills({botId: bot.id})
    }
  }

  render() {
    const { bot, skills, creating, history, location, actions, skillActions } = this.props
    const { dialogSkill } = this.state
    const dialogVisible = !!dialogSkill

    const skillsItems = skills
                      ? skills.map(skill => (
                        <SkillListItem skill={skill} key={skill.id}
                                       active={location.pathname == routes.botSkill(bot.id, skill.id)}
                                       onClick={() => history.push(routes.botSkill(bot.id, skill.id))}
                                       onToggleSkill={() => skillActions.toggleSkill(skill)}
                                       onRenameSkill={() => openDialog(skill)}
                                       onDeleteSkill={() => skillActions.deleteSkill(skill)} />
                      ))
                      : [<SidebarItem key="loading"
                                   icon={skillIcon('LOADING')}
                                   label="Loading skills..." />]

    const skillKindItems = SKILL_KINDS.map(kind => ({
      key: kind,
      primaryText: defaultSkillName(kind),
      leftIcon: <FontIcon>{skillIcon(kind)}</FontIcon>,
      onClick: () => {
        if (isSkillRenameable(kind)) {
          openDialog({ kind, name: defaultSkillName(kind) })
        } else {
          actions.createSkill({botId: bot.id}, {kind}, history)
        }
      }
    }))

    const openDialog = (skill) => {
      this.setState({ dialogSkill: skill })
    }

    const closeDialog = () => {
      this.setState({ dialogSkill: null })
    }

    const dialogSubmit = (name) => {
      const { dialogSkill } = this.state
      if (dialogSkill && dialogSkill.kind) {
        const { kind, id } = dialogSkill
        if (id) {
          skillActions.updateSkill({...dialogSkill, name})
        } else {
          actions.createSkill({botId: bot.id}, {kind, name}, history)
        }
      }
      closeDialog()
    }

    return (
      <SideBar title="Skills">
        <SidebarItem icon={skillIcon('front_desk')}
                  label="Front desk"
                  active={location.pathname == routes.botFrontDesk(bot.id)}
                  onClick={() => history.push(routes.botFrontDesk(bot.id))}/>

        {skillsItems}

        <DropdownMenu id="add-skill-menu"
                      cascading
                      block={true}
                      anchor={{x: DropdownMenu.HorizontalAnchors.INNER_LEFT, y: DropdownMenu.VerticalAnchors.OVERLAP}}
                      position={DropdownMenu.Positions.TOP_LEFT}
                      menuItems={skillKindItems}>
          <SidebarItem id="add-skill"
                    icon={skillIcon('ADD')}
                    label="Add skill"
                    className="addlink"
                    onClick={(e) => e.stopPropagation() }/>
        </DropdownMenu>

        <SkillNameDialog visible={dialogVisible}
                         skill={dialogSkill}
                         onClose={closeDialog}
                         onSubmit={dialogSubmit} />
      </SideBar>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { scope, items, creating } = state.skills
  if (scope && scope.botId == bot.id && items) {
    return {
      skills: sortBy(Object.values(items), 'order'),
      creating
    }
  } else {
    return { skills: null }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  skillActions: bindActionCreators(skillActions, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SkillsBar))
