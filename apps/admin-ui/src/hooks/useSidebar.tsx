import {useAtom} from "jotai";
import {activeSideBarItems} from "../configs/constants";

const UseSidebar = () => {
    const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItems)
    return {
        activeSidebar, setActiveSidebar
    }
};

export default UseSidebar;