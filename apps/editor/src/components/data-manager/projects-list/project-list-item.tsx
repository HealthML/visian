import { ListItem, OptionSelector, Text } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useUpdateProjectsMutation } from "../../../queries";
import { Project } from "../../../types";
import { ProjectEditPopup } from "../project-edit-popup";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const ClickableText = styled(Text)`
  cursor: pointer;
`;

export const ProjectListItem = ({
  project,
  deleteProject,
  isLast,
}: {
  project: Project;
  deleteProject: () => void;
  isLast: boolean;
}) => {
  const navigate = useNavigate();

  // edit project popup
  const [isEditProjectPopupOpen, setIsEditProjectPopupOpen] = useState(false);
  const openEditProjectPopup = useCallback(
    () => setIsEditProjectPopupOpen(true),
    [],
  );
  const closeEditProjectPopup = useCallback(
    () => setIsEditProjectPopupOpen(false),
    [],
  );

  const updateProject = useUpdateProjectsMutation();

  return (
    <ListItem isLast={isLast}>
      <ClickableText
        onClick={() => navigate(`/projects/${project.id}/datasets`)}
      >
        {project.name}
      </ClickableText>
      <ExpandedSpacer />
      <OptionSelector
        options={[
          {
            value: "delete",
            labelTx: "delete",
            icon: "trash",
            iconSize: 30,
            onSelected: deleteProject,
          },
          {
            value: "edit",
            label: "Edit",
            icon: "plus",
            onSelected: openEditProjectPopup,
          },
        ]}
      />
      <ProjectEditPopup
        oldName={project.name}
        isOpen={isEditProjectPopupOpen}
        onClose={closeEditProjectPopup}
        onConfirm={(newName) =>
          updateProject.mutate({ ...project, name: newName })
        }
      />
    </ListItem>
  );
};

export default ProjectListItem;
