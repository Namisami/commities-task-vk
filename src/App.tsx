import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppRoot,
  View,
  Panel,
  PanelHeader,
  Group,
  Avatar,
  Header,
  SimpleCell,
  Spinner,
  FormLayoutGroup,
  FormItem,
  Select,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import mockData from './config/groups.json'; 
import { GradientColors } from './types/GradientColors';
import { UserI } from './types/User';
import { GroupI } from './types/Group';
import { GetGroupsResponseI } from './types/GetGroupsResponse';

import './App.css';

const GRADIENT_COLORS = {
  'red': 1,
  'orange': 2,
  'yellow': 3,
  'green': 4,
  'l-blue': 5,
  'violet': 6,
};

function App() {
  const [activePanel, setActivePanel] = useState('communities');
  const [showFriends, setShowFriends] = useState<{id: number, friends: UserI[] | undefined } | null>(null);
  const [currentFriend, setCurrentFriend] = useState<UserI | null>(null);
  const [error, setError] = useState('');
  const [groupList, setGroupList] = useState<GroupI[]>([]);
  const [filters, setFilters] = useState({
    type: 'Все',
    color: 'Любой',
    friends: 'Все'
  })

  useEffect(() => {
    // Пример запроса на сервер!!
    // axios
    //   .get<GroupI[], GetGroupsResponseI>('imagine-backend-here/groups')
    //   .then((res) => {
    //     if (!res.data || res.result === 0) {
    //       return setError('Произошла ошибка');
    //     }
    //     setGroupList(res.data);
    //   })
    //   .catch((err) => setError(err))
    setTimeout(() => {
      setError('');
      setGroupList(mockData);
    }, 1000);
  }, [])

  useEffect(() => {
    let filteredData = [...mockData];
    if (filters.type !== 'Все') {
      if (filters.type === 'Закрытая') {
        filteredData = filteredData.filter((group) => group.closed === true)
      } else {
        filteredData = filteredData.filter((group) => group.closed === false)
      }
    }
    if (filters.color !== 'Любой') {
      filteredData = filteredData.filter((group) => group.avatar_color === filters.color)
    }
    if (filters.friends !== 'Все') {
      if (filters.friends === 'С друзьями') {
        filteredData = filteredData.filter((group) => typeof group.friends !== 'undefined')
      } else {
        filteredData = filteredData.filter((group) => typeof group.friends === 'undefined')
        console.log(filteredData);
      }
    }
    if (filteredData.length) {
      setError('');
      setGroupList(filteredData);
    } else {
      setError('Ничего не найдено')
      setGroupList([]);
    }
  }, [filters])

  const getAvailableColors = () => {
    let colors: string[] = [];
    mockData.forEach((group) => {
      if (group.avatar_color) {
        colors.push(group.avatar_color);
      }
    })
    return [...new Set(colors)];
  }

  // const calcColor = (color: string | undefined) => {
  //   if (typeof color === 'undefined') {
  //     return;
  //   }
  //   if (color in GradientColors) {
  //     return GradientColors[color as keyof typeof GradientColors];
  //   }
  //   return color;
  // }

  const friendsInGroup = (group: GroupI) => {
    if (!group.friends) {
      return;
    }
    if (showFriends === null || group.id !== showFriends.id) {
      return <span className='group__friends' onClick={ () => setShowFriends({...showFriends, friends: group.friends, id: group.id}) }>({group.friends?.length} друга)</span>;
    }
    return (
      <>
        <span className='group__friend-list'>
          {group.friends.map((friend: UserI) => <Avatar size={ 30 } 
            onMouseOver={ () => setCurrentFriend(friend) }
            onMouseLeave={ () => setCurrentFriend(null) }
            src='#' 
            gradientColor={ 'blue' } 
            initials={ `${friend.first_name.charAt(0)}${friend.last_name.charAt(0)}` }  />
          )}
        </span>
        { currentFriend &&
          <span className='group__current-friend'>
            { currentFriend.first_name } { currentFriend.last_name }
          </span>
        }
      </>
    )
  }

  const groupListRender = groupList.map((group: GroupI) => <SimpleCell
      key={ group.id }
      before={ <Avatar size={ 100 } src='#' style={{
        background: group.avatar_color
      }} /> }
      subtitle={ group.closed ? "Закрытая" : "Открытая" }
      extraSubtitle={ 
        <div className='group__members'>
          {group.members_count} подписчиков { friendsInGroup(group) }
        </div> 
      }
    >
      <span className='group__title'>
        { `${group.name}` }
      </span>
    </SimpleCell>
  )

  return (
    <AppRoot>
      <View activePanel={ activePanel }>
        <Panel id='communities'>
          <PanelHeader>Сообщества</PanelHeader>
          <Group header={ <Header mode="secondary">Список диалогов</Header> }>
            <FormLayoutGroup>
              <FormItem top="Тип группы">
                <Select
                  value={ filters.type }
                  onChange={ (e) => setFilters({...filters, type: e.target.value}) }
                  options={[
                    { label: 'Все', value: 'Все' },
                    { label: 'Закрытая', value: 'Закрытая' },
                    { label: 'Открытая', value: 'Открытая' },
                  ]}
                />
              </FormItem>
              <FormItem top="Цвет">
                <Select
                  value={ filters.color }
                  onChange={ (e) => setFilters({...filters, color: e.target.value}) }
                  options={[
                    { label: 'Любой', value: 'Любой' },
                  ].concat(getAvailableColors().map((color) => {
                    return { label: color, value: color}
                  }))}
                />
              </FormItem>
              <FormItem top="Наличие друзей">
                <Select
                  value={ filters.friends }
                  onChange={ (e) => setFilters({...filters, friends: e.target.value}) }
                  options={[
                    { label: 'Все', value: 'Все' },
                    { label: 'С друзьями', value: 'С друзьями' },
                    { label: 'Без друзей', value: 'Без друзей' },
                  ]}
                />
              </FormItem>
            </FormLayoutGroup>
            { !error 
              ? groupList.length ? groupListRender : <Spinner size='large' style={{ marginBottom: '20px' }} />
              : error
            }
          </Group>
        </Panel>
      </View>
    </AppRoot>
  )
}

export default App
