import { Col, List, Row } from 'antd';
import React, { useMemo, useState } from 'react';
import { useConfig, useProposals } from '../../contexts/proposals';
import './style.less'; // Don't remove this line, it will break dark mode if you do due to weird transpiling conditions
import { StateBadge } from '../../components/Proposal/StateBadge';
import { useHistory, useParams } from 'react-router-dom';
import { TokenIcon, useConnectionConfig, useWallet } from '@oyster/common';
import { NewProposalMenuItem } from '../proposal/new';
const PAGE_SIZE = 10;

export const ProposalsView = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { proposals } = useProposals();
  const config = useConfig(id);
  const [page, setPage] = useState(0);
  const { tokenMap } = useConnectionConfig();
  const { connected } = useWallet();
  const token = tokenMap.get(config?.info.governanceMint.toBase58() || '') as any;
  const tokenBackground = token?.extensions?.background || 'https://solana.com/static/8c151e179d2d7e80255bdae6563209f2/6833b/validators.webp';

  const mint = config?.info.governanceMint.toBase58() || '';

  const listData = useMemo(() => {
    const newListData: any[] = [];

    Object.keys(proposals).forEach(key => {
      const proposal = proposals[key];
      if(proposal.info.config.toBase58() !== id) {
        return;
      }

      newListData.push({
        href: '/proposal/' + key,
        title: proposal.info.state.name,
        badge: <TokenIcon mintAddress={mint} size={30} />,
        status: proposal.info.state.status,
        proposal,
      });
    });
    return newListData;
  }, [proposals]);


  return (
    <Row style={{ background: `url(${tokenBackground})`, height: '100%' }}>
      <Col flex="auto"  xxl={15} xs={24} className="proposals-container">
        <div className="proposals-header">
          <TokenIcon mintAddress={config?.info.governanceMint} size={60} style={{ marginRight: 20 }} />
          <div>
            <h1>{config?.info.name}</h1>
            <a href={tokenMap.get(mint)?.extensions?.website} target="_blank">
              {tokenMap.get(mint)?.extensions?.website}
            </a>
          </div>

          <NewProposalMenuItem className="proposals-new-btn" disabled={!connected} />
        </div>
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: page => {
              setPage(page);
            },
            pageSize: PAGE_SIZE,
          }}
          dataSource={listData}
          renderItem={item => (
              <List.Item key={item.title}className="proposal-item" onClick={() => history.push(item.href)}>
                <List.Item.Meta
                  avatar={item.badge}
                  title={item.title}
                  description={<StateBadge proposal={item.proposal} />}
                />
              </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};
