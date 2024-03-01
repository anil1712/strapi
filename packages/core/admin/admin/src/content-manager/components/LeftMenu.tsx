import * as React from 'react';

import {
  SubNav,
  SubNavHeader,
  SubNavLink,
  SubNavSection,
  SubNavSections,
} from '@strapi/design-system/v2';
import { useCollator, useFilter } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import * as Icons from '@strapi/icons';
import { useTypedSelector } from '../../core/store/hooks';
import { getTranslation } from '../utils/translations';

const LeftMenu = () => {
  const [search, setSearch] = React.useState('');
  const { formatMessage, locale } = useIntl();
  const collectionTypeLinks = useTypedSelector(
    (state) => state['content-manager_app'].collectionTypeLinks
  );
  const singleTypeLinks = useTypedSelector((state) => state['content-manager_app'].singleTypeLinks);

  const { startsWith } = useFilter(locale, {
    sensitivity: 'base',
  });

  const formatter = useCollator(locale, {
    sensitivity: 'base',
  });

  const menu = React.useMemo(
    () =>
      [
        {
          id: 'collectionTypes',
          title: formatMessage({
            id: getTranslation('components.LeftMenu.collection-types'),
            defaultMessage: 'Collection Types',
          }),
          searchable: true,
          links: collectionTypeLinks,
        },
        {
          id: 'singleTypes',
          title: formatMessage({
            id: getTranslation('components.LeftMenu.single-types'),
            defaultMessage: 'Single Types',
          }),
          searchable: true,
          links: singleTypeLinks,
        },
      ].map((section) => ({
        ...section,
        links: section.links
          /**
           * Filter by the search value
           */
          .filter((link) => startsWith(link.title, search))
          /**
           * Sort correctly using the language
           */
          .sort((a, b) => formatter.compare(a.title, b.title))
          /**
           * Apply the formated strings to the links from react-intl
           */
          .map((link) => {
            return {
              ...link,
              title: formatMessage({ id: link.title, defaultMessage: link.title }),
            };
          }),
      })),
    [collectionTypeLinks, search, singleTypeLinks, startsWith, formatMessage, formatter]
  );

  const handleClear = () => {
    setSearch('');
  };

  const handleChangeSearch = ({ target: { value } }: { target: { value: string } }) => {
    setSearch(value);
  };

  const label = formatMessage({
    id: getTranslation('header.name'),
    defaultMessage: 'Content',
  });

  console.log('==menu', menu);

  const sidebarMenus = [{
    key: 'question',
    title: 'Question',
    items: []
  }, {
    key: 'learn',
    title: 'Course',
    items: [],
  }, {
    key: 'news',
    title: 'News',
    items: []
  }, {
    key: 'more',
    title: 'More',
    items: []
  }, {
    key: 'about',
    title: 'About',
    items: []
  }];

  menu && menu.length && menu[0].links.forEach(k => {
    sidebarMenus.forEach((y, index) => {
      const _title = k.title.toLowerCase();
      if(_title.startsWith(sidebarMenus[index].key)) {
        const updatedTitle = _title.split(sidebarMenus[index].key)[1];
        console.log('===updatedTitle', updatedTitle)
        k.title = updatedTitle.trim();
        // k.icon = <Icons.Pencil />
        sidebarMenus[index].items.push(k);
      }
    });
  });

  console.log('===sidebarMenus', sidebarMenus);

  return (
    <SubNav ariaLabel={label}>
      <SubNavHeader label={'Menus'} />
      <SubNavSections>
        {sidebarMenus.map((section) => {
          return (
            <SubNavSection
              key={section.key}
              label={section.title}
              // badgeLabel={section.links.length.toString()}
            >
              {section.items.map((link) => {
                // const search = link.search ? `?${link.search}` : '';

                return (
                  // @ts-expect-error – DS inference does not work with the `as` prop.
                  <SubNavLink as={NavLink} key={link.uid} to={`${link.to}`} icon={link.icon}>
                    <span style={{textTransform: 'capitalize'}}>{link.title}</span>
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
    </SubNav>
  );

  return (
    <SubNav ariaLabel={label}>
      <SubNavHeader
        label={label}
        searchable
        value={search}
        onChange={handleChangeSearch}
        onClear={handleClear}
        searchLabel={formatMessage({
          id: 'content-manager.components.LeftMenu.Search.label',
          defaultMessage: 'Search for a content type',
        })}
      />
      <SubNavSections>
        {menu.map((section) => {
          return (
            <SubNavSection
              key={section.id}
              label={section.title}
              badgeLabel={section.links.length.toString()}
            >
              {section.links.map((link) => {
                const search = link.search ? `?${link.search}` : '';

                return (
                  // @ts-expect-error – DS inference does not work with the `as` prop.
                  <SubNavLink as={NavLink} key={link.uid} to={`${link.to}${search}`}>
                    {link.title}
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
    </SubNav>
  );
};

export { LeftMenu };
