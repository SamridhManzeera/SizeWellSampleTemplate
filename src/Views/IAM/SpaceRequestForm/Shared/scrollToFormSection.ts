function scrollToFormSection(sectionId: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

export default scrollToFormSection;
