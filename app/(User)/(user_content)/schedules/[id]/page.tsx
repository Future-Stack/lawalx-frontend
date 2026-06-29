/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useScheduleDetail } from "./_hooks/useScheduleDetail";

// Components
import DetailHeader from "./_components/DetailHeader";
import BasicInfoForm from "./_components/BasicInfoForm";
import ContentSection from "./_components/ContentSection";
import ScheduleTimeSection from "./_components/ScheduleTimeSection";
import AssignedScreensSection from "./_components/AssignedScreensSection";
import ContentPreview from "./_components/ContentPreview";
import AddScreenDialog from "./_components/AddScreenDialog";
import AddContentDialog from "./_components/AddContentDialog";
import AddLowerThirdDialog from "./_components/AddLowerThirdDialog";
import { DeleteConfirmationModal } from "@/components/schedules/DeleteModal";

export default function ScheduleDetailPage() {
  const {
    id,
    isNew,
    isLoading,
    isError,
    schedule,
    name,
    description,
    contentType,
    repeat,
    startTime,
    endTime,
    startDate,
    endDate,
    content,
    daysOfWeek,
    dayOfMonth,
    assignedScreens,
    isUpdating,
    playingIndex,
    setPlayingIndex,
    isAddScreenOpen,
    setIsAddScreenOpen,
    isAddContentOpen,
    setIsAddContentOpen,
    isAddLowerThirdOpen,
    setIsAddLowerThirdOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    localActive,
    localLowerThirdData,
    localFiles,
    setLocalName,
    setLocalDescription,
    setLocalContentType,
    setLocalRepeat,
    setLocalStartTime,
    setLocalEndTime,
    setLocalStartDate,
    setLocalEndDate,
    setLocalDaysOfWeek,
    setLocalDayOfMonth,
    setLocalFiles,
    setRemovedFileIds,
    setLocalLowerThirdIds,
    setLocalLowerThirdData,
    refetch,
    handleSave,
    handleDeleteSchedule,
    handleConfirmDelete,
    handleRemoveDevice,
    handleAddDevices,
  } = useScheduleDetail();

  // Only show the global loading spinner on initial load (when data is missing)
  if (isLoading && !schedule && !isNew) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bgBlue"></div>
      </div>
    );
  }

  if (isError && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          Failed to load schedule data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <DetailHeader
        isNew={isNew}
        name={name}
        onSave={handleSave}
        isSaving={isUpdating}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 w-full space-y-6 order-2 lg:order-1">
          <BasicInfoForm
            name={name}
            setName={(val) => setLocalName(val)}
            description={description}
            setDescription={(val) => setLocalDescription(val)}
          />

          <ContentSection
            scheduleId={id as string}
            contentType={contentType}
            setContentType={(val) => setLocalContentType(val)}
            content={content}
            playingIndex={playingIndex}
            onItemClick={setPlayingIndex}
            onAddContent={() => setIsAddContentOpen(true)}
            onAddTextSection={() => setIsAddLowerThirdOpen(true)}
            onRemoveContent={(id) => {
              if (localFiles) {
                setLocalFiles((prev) =>
                  (prev ?? []).filter((f: any) => f.id !== id),
                );
              } else {
                setRemovedFileIds((prev) => [...prev, id]);
              }
              // Reset playing index if the removed item was active or out of bounds
              setPlayingIndex(0);
              refetch();
            }}
          />

          <ScheduleTimeSection
            data={{
              repeat: repeat,
              playTime: startTime,
              endTime: endTime,
              startDate: startDate,
              endDate: endDate,
            }}
            onChange={(newData: any) => {
              if (newData.repeat !== undefined) setLocalRepeat(newData.repeat);
              if (newData.playTime !== undefined)
                setLocalStartTime(newData.playTime);
              if (newData.endTime !== undefined)
                setLocalEndTime(newData.endTime);
              if (newData.startDate !== undefined)
                setLocalStartDate(newData.startDate);
              if (newData.endDate !== undefined)
                setLocalEndDate(newData.endDate);
              if (newData.daysOfWeek !== undefined)
                setLocalDaysOfWeek(newData.daysOfWeek);
              if (newData.dayOfMonth !== undefined)
                setLocalDayOfMonth(newData.dayOfMonth);
            }}
            daysOfWeek={daysOfWeek}
            dayOfMonth={dayOfMonth}
          />

          <AssignedScreensSection
            assignedScreens={assignedScreens}
            onAddScreen={() => setIsAddScreenOpen(true)}
            onRemoveDevice={handleRemoveDevice}
            onDeleteSchedule={handleDeleteSchedule}
            isNew={isNew}
          />
        </div>

        {/* Right Column: Preview */}
        <ContentPreview
          items={content}
          playingIndex={playingIndex}
          setPlayingIndex={setPlayingIndex}
          lowerThird={
            localLowerThirdData ||
            schedule?.lowerThird ||
            (schedule?.lowerThirds && schedule.lowerThirds.length > 0
              ? schedule.lowerThirds[0]
              : undefined)
          }
          localActive={localActive}
          isUpdating={isUpdating}
          repeat={repeat}
          daysOfWeek={daysOfWeek}
          dayOfMonth={dayOfMonth}
          startTime={startTime}
          endTime={endTime}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      <AddScreenDialog
        isOpen={isAddScreenOpen}
        onClose={() => setIsAddScreenOpen(false)}
        onAdd={handleAddDevices}
      />

      <AddContentDialog
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        onSelect={(files) => {
          const existing = localFiles ?? (schedule?.files || []);
          const existingIds = new Set(existing.map((f: any) => f.id));
          const merged = [
            ...existing,
            ...files.filter((f: any) => !existingIds.has(f.id)),
          ];
          setLocalFiles(merged as any);
          setRemovedFileIds([]);
        }}
        existingFileIds={schedule?.files?.map((f) => f.id) || []}
      />

      <AddLowerThirdDialog
        isOpen={isAddLowerThirdOpen}
        onClose={() => setIsAddLowerThirdOpen(false)}
        onLowerThirdCreated={(id, config) => {
          setLocalLowerThirdIds([id]);
          if (config) {
            setLocalLowerThirdData({
              text: config.message,
              textColor: config.textColor,
              font: config.fontFamily,
              fontSize:
                config.fontSize === "14"
                  ? "Small"
                  : config.fontSize === "16"
                    ? "Medium"
                    : "Large",
              duration: config.duration,
              backgroundColor: config.backgroundColor,
              backgroundOpacity: String(config.backgroundOpacity),
              animation: config.enableAnimation
                ? config.animationDirection === "right-to-left"
                  ? "Right_to_Left"
                  : "Left_to_Light"
                : "None",
              loop: config.loop,
              speed:
                config.speed === "slow"
                  ? 20
                  : config.speed === "medium"
                    ? 40
                    : 60,
              position: config.position === "top" ? "Top" : "Bottom",
            });
          }
        }}
        existingLowerThird={
          schedule?.lowerThird ||
          (schedule?.lowerThirds && schedule.lowerThirds.length > 0
            ? schedule.lowerThirds[0]
            : undefined)
        }
        scheduleContent={localFiles ?? schedule?.files}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        scheduleName={name}
      />
    </div>
  );
}
